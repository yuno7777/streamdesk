const { Pool } = require('pg');

// Run with: node --env-file=.env.local scripts/migrate-data.js
const ohioUrl = process.env.SOURCE_DATABASE_URL;
const singaporeUrl = process.env.DATABASE_URL;

if (!ohioUrl || !singaporeUrl) {
  console.error('Missing SOURCE_DATABASE_URL (Ohio) or DATABASE_URL (Singapore). Set them in .env.local.');
  process.exit(1);
}

async function migrate() {
  console.log('Initializing database connection pools...');
  const ohioPool = new Pool({ connectionString: ohioUrl });
  const singaporePool = new Pool({ connectionString: singaporeUrl });

  try {
    console.log('Fetching tickets from Ohio database...');
    const ticketsRes = await ohioPool.query('SELECT * FROM tickets ORDER BY id ASC');
    console.log(`Found ${ticketsRes.rows.length} tickets to migrate.`);

    console.log('Fetching notes from Ohio database...');
    const notesRes = await ohioPool.query('SELECT * FROM notes ORDER BY id ASC');
    console.log(`Found ${notesRes.rows.length} notes to migrate.`);

    console.log('Migrating tickets to Singapore database...');
    for (const row of ticketsRes.rows) {
      await singaporePool.query(
        `INSERT INTO tickets (
          ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (ticket_id) DO NOTHING`,
        [
          row.ticket_id,
          row.customer_name,
          row.customer_email,
          row.subject,
          row.description,
          row.status,
          row.created_at,
          row.updated_at
        ]
      );
    }
    console.log('Tickets migration complete.');

    console.log('Migrating notes to Singapore database...');
    for (const row of notesRes.rows) {
      await singaporePool.query(
        `INSERT INTO notes (
          ticket_id, note_text, created_at
        ) VALUES ($1, $2, $3)`,
        [
          row.ticket_id,
          row.note_text,
          row.created_at
        ]
      );
    }
    console.log('Notes migration complete.');

    console.log('Migration completed successfully with zero data loss!');
  } catch (err) {
    console.error('Error during data migration:', err);
  } finally {
    await ohioPool.end();
    await singaporePool.end();
  }
}

migrate();
