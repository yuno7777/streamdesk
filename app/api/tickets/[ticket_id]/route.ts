import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params;

    // Fetch the ticket details
    const ticketResult = await query(
      'SELECT ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at FROM tickets WHERE ticket_id = $1',
      [ticket_id]
    );

    if (ticketResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: `Ticket with ID ${ticket_id} does not exist.` },
        { status: 404 }
      );
    }

    const ticket = ticketResult.rows[0];

    // Fetch associated activity notes chronologically
    const notesResult = await query(
      'SELECT id, note_text, created_at FROM notes WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticket_id]
    );

    const ticketDetails = {
      ...ticket,
      notes: notesResult.rows,
    };

    return NextResponse.json(ticketDetails);
  } catch (error: any) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch ticket details.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params;
    const body = await request.json();
    const { status, note_text } = body;

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Bad Request', message: `status must be one of: ${VALID_STATUSES.join(', ')}.` },
        { status: 400 }
      );
    }

    // Check if the ticket exists
    const ticketCheck = await query(
      'SELECT id FROM tickets WHERE ticket_id = $1',
      [ticket_id]
    );

    if (ticketCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Not Found', message: `Ticket with ID ${ticket_id} does not exist.` },
        { status: 404 }
      );
    }

    let updated_at = new Date();

    // Update ticket status and set updated_at to NOW() if status is provided
    if (status) {
      const updateResult = await query(
        'UPDATE tickets SET status = $1, updated_at = NOW() WHERE ticket_id = $2 RETURNING updated_at',
        [status, ticket_id]
      );
      if (updateResult.rows[0]) {
        updated_at = updateResult.rows[0].updated_at;
      }
    }

    // Insert note if note_text is provided
    if (note_text && note_text.trim() !== '') {
      await query(
        'INSERT INTO notes (ticket_id, note_text) VALUES ($1, $2)',
        [ticket_id, note_text.trim()]
      );
    }

    return NextResponse.json({ success: true, updated_at });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update ticket.' },
      { status: 500 }
    );
  }
}
