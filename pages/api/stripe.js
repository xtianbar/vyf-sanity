import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const params = {
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        shipping_options: [
          { shipping_rate: 'shr_1NDVMDI17tt2p4BZh04tbR2l' },
          { shipping_rate: 'shr_1NDVK6I17tt2p4BZDVy9uriI' },
        ],
        line_items: req.body.map((item) =>{
            const img = item.image[0].asset._ref;
            const newImage = img.replace('image-','https://cdn.sanity.io/images/kb6y77px/sanity_studio/')
            .replace('-jpg', '.jpg')
            // .replace('-webp','.webp', '-png', '.png', '-jpeg', '.jpeg', '-jpg', '.jpg')
            
            return {
                price_data: {
                    currency: 'php',
                    product_data: {
                        name: item.name,
                        images:[newImage],
                    },
                    unit_amount: item.price * 100,

                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1
                },
                quantity: item.quantity
            }
        }),
          success_url: `${req.headers.origin}/success`,
          cancel_url: `${req.headers.origin}/?canceled=true`,
        }

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);

      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
