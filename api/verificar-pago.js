export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/pagos?email=eq.${encodeURIComponent(email)}&confirmado=eq.true&order=created_at.desc&limit=1`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    const data = await response.json();
    const confirmado = Array.isArray(data) && data.length > 0;

    return res.status(200).json({ 
      confirmado,
      nombre: confirmado ? data[0].nombre : null
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}