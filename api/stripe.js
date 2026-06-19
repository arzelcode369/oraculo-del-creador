export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, email } = req.body;

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': 'price_1TjTPiFTtpqZUj3pTWyaNDZZ',
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'customer_email': email,
        'success_url': 'https://oraculo-del-creador.vercel.app/?pago=exitoso&nombre=' + encodeURIComponent(nombre),
        'cancel_url': 'https://oraculo-del-creador.vercel.app/?pago=cancelado',
        'metadata[nombre]': nombre,
      }).toString()
    });

    const session = await response.json();

    if (session.error) {
      return res.status(400).json({ error: session.error.message });
    }

    return res.status(200).json({ url: session.url });

  } catch (error) {
    return res.status(500).json({ error: 'Error creando sesión de pago' });
  }
}