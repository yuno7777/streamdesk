import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const countsResult = await query(`
      SELECT 
        COUNT(*)::integer as total,
        COUNT(*) FILTER (WHERE status = 'Open')::integer as open,
        COUNT(*) FILTER (WHERE status = 'In Progress')::integer as in_progress,
        COUNT(*) FILTER (WHERE status = 'Closed')::integer as closed
      FROM tickets
    `);
    
    const row = countsResult.rows[0];
    
    return NextResponse.json({
      total: row.total || 0,
      open: row.open || 0,
      inProgress: row.in_progress || 0,
      closed: row.closed || 0
    });
  } catch (error: any) {
    console.error('Error fetching ticket statistics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch ticket statistics.' },
      { status: 500 }
    );
  }
}
