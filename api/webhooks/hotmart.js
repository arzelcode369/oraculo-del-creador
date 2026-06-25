export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Verificar que es un pago aprobado de Hotmart
    const evento = body.event;
    if (evento !== 'PURCHASE_APPROVED' && evento !== 'PURCHASE_COMPLETE') {
      return res.status(200).json({ received: true });
    }

    // Extraer datos del comprador
    const comprador = body.data?.buyer;
    const compra    = body.data?.purchase;

    const email     = comprador?.email || '';
    const nombre    = comprador?.name  || '';
    const hotmart_id = compra?.transaction || '';

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Guardar en Supabase
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/pagos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          email,
          nombre,
          hotmart_id,
          confirmado: true
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Error guardando pago' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}