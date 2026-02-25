import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  const sql = neon(process.env.DATABASE_URL);

  // Handle GET request: Fetch bids for a specific event
  if (request.method === 'GET') {
    const { eventId } = request.query;
    const bids = await sql`SELECT * FROM bids WHERE event_id = ${eventId} ORDER BY amount DESC`;
    return response.status(200).json(bids);
  }

  // Handle POST request: Save a new bid
  if (request.method === 'POST') {
    const { eventId, amount, email } = request.body;
    await sql`INSERT INTO bids (event_id, amount, user_email) VALUES (${eventId}, ${amount}, ${email})`;
    return response.status(200).json({ message: 'Bid placed successfully!' });
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
