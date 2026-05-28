import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/tickets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `SELECT ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at FROM tickets`;
    const conditions: string[] = [];
    const params: any[] = [];

    // Apply status filter if present and not 'All'
    if (status && status !== 'All') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    // Apply search filter if present
    if (search) {
      params.push(`%${search}%`);
      const searchIdx = params.length;
      conditions.push(`(
        customer_name ILIKE $${searchIdx} OR
        customer_email ILIKE $${searchIdx} OR
        ticket_id ILIKE $${searchIdx} OR
        subject ILIKE $${searchIdx} OR
        description ILIKE $${searchIdx}
      )`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', message: 'Failed to fetch tickets.' },
      { status: 500 }
    );
  }
}

// POST /api/tickets
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, subject, description } = body;

    // Field presence validation
    if (!customer_name || !customer_email || !subject || !description) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'All fields (customer_name, customer_email, subject, description) are required.' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid customer_email format.' },
        { status: 400 }
      );
    }

    // Auto-generate ticket_id "TKT-001", "TKT-002", ... from the highest existing
    // suffix (not COUNT, which reuses IDs after a delete).
    const maxRes = await query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_id FROM 5) AS INTEGER)), 0) AS max_num
       FROM tickets WHERE ticket_id ~ '^TKT-[0-9]+$'`
    );
    const nextNum = parseInt(maxRes.rows[0].max_num, 10) + 1;
    const ticket_id = `TKT-${String(nextNum).padStart(3, '0')}`;

    const insertSql = `
      INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status)
      VALUES ($1, $2, $3, $4, $5, 'Open')
      RETURNING ticket_id, created_at
    `;
    const result = await query(insertSql, [
      ticket_id,
      customer_name,
      customer_email,
      subject,
      description,
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to create ticket.' },
      { status: 500 }
    );
  }
}
