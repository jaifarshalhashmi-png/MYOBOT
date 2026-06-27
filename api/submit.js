const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, interests, message, submittedAt } = req.body || {};

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        interests TEXT,
        message TEXT,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;

    await sql`
      INSERT INTO waitlist (name, email, interests, message, submitted_at)
      VALUES (
        ${name || ''},
        ${email},
        ${Array.isArray(interests) ? interests.join(', ') : ''},
        ${message || ''},
        ${submittedAt || new Date().toISOString()}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        interests = EXCLUDED.interests,
        message = EXCLUDED.message,
        submitted_at = EXCLUDED.submitted_at
    `;

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
};
