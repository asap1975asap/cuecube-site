const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Demo user
const DEMO_USER = {
  email: 'demo@cuecube.com',
  password: '123Qwerty123'
};

// Products — only two: CueCube Grey and CueCube Keychain Grey
const products = [
  {
    id: 0,
    name: 'CueCube - Grey',
    brand: 'CueCube',
    basePrice: 15.0,
    descriptionShort: 'Original cue tip shaper and scuffer.',
    descriptionLong: `
Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides automatic nickel (.418") or dime (.353") radius on shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.
Quick and easy-to-use, even during tournament play.
Great for any Pool Player.

Product specifications:
Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.4 oz. (40 gr)
    `.trim(),
    tipProfiles: [
      {
        code: '.418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue_cube_418_grey_1.jpg',
          '/images/cue_cube_418_grey_2.jpg',
          '/images/cue_cube_418_grey_3.jpg'
        ]
      },
      {
        code: '.353',
        label: '.353 in (Dime)',
        images: [
          '/images/cue_cube_353_grey_1.jpg',
          '/images/cue_cube_353_grey_2.jpg',
          '/images/cue_cube_353_grey_3.jpg'
        ]
      }
    ]
  },
  {
    id: 1,
    name: 'CueCube Keychain - Grey',
    brand: 'CueCube',
    basePrice: 15.0,
    descriptionShort: 'CueCube with keychain ring.',
    descriptionLong: `
Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides an automatic nickel (.418") radius on the shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.
Cue Cubes w/keychain are available in a variety of popular colors.
Quick and easy-to-use, even during tournament play.
Great for any Pool Player.

Product specifications:
Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.6 oz. (46 gr)
    `.trim(),
    tipProfiles: [
      {
        code: '.418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue_cube_418_keychain_grey_1.jpg',
          '/images/cue_cube_418_keychain_grey_2.jpg',
          '/images/cue_cube_418_keychain_grey_3.jpg'
        ]
      },
      {
        code: '.353',
        label: '.353 in (Dime)',
        images: [
          '/images/cue_cube_418_keychain_grey_1.jpg',
          '/images/cue_cube_418_keychain_grey_2.jpg',
          '/images/cue_cube_418_keychain_grey_3.jpg'
        ]
      }
    ]
  }
];

// Price tiers
function calculateUnitPrice(base, qty) {
  if (qty >= 100) return +(base * 0.85 * 0.85).toFixed(2); // double 15% off
  if (qty >= 50) return +(base * 0.85).toFixed(2); // 15% off
  return base;
}

// Fake session
let loggedIn = false;

// middleware
app.use((req, res, next) => {
  res.locals.isAuthenticated = loggedIn;
  next();
});

// ROUTES
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    loggedIn = true;
    return res.redirect('/products');
  }
  res.render('login', { title: 'Login', error: 'Invalid email or password' });
});

app.get('/logout', (req, res) => {
  loggedIn = false;
  res.redirect('/');
});

app.get('/products', (req, res) => {
  if (!loggedIn) return res.redirect('/login');
  const list = products.map(p => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    descriptionShort: p.descriptionShort,
    priceFrom: calculateUnitPrice(p.basePrice, 100),
    tipProfiles: p.tipProfiles
  }));
  res.render('products', { title: 'Products', products: list });
});

// JSON endpoint for image switch
app.get('/products/:id', (req, res, next) => {
  if (req.query.json === '1') {
    const id = parseInt(req.params.id, 10);
    const product = products.find(p => p.id === id);
    if (!product) return res.json({ error: 'not found' });
    const tip = req.query.tip || product.tipProfiles[0].code;
    const tipObj = product.tipProfiles.find(t => t.code === tip) || product.tipProfiles[0];
    return res.json({
      images: tipObj.images,
      tip: tipObj.code
    });
  }
  next();
});

// Product page
app.get('/products/:id', (req, res) => {
  if (!loggedIn) return res.redirect('/login');
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).send('Product not found');
  const activeTip = product.tipProfiles[0];
  res.render('product-detail', {
    title: product.name,
    product,
    activeTip,
    qty: 10,
    unitPrice: calculateUnitPrice(product.basePrice, 10),
    totalPrice: calculateUnitPrice(product.basePrice, 10) * 10
  });
});

// Order page
app.get('/order', (req, res) => {
  if (!loggedIn) return res.redirect('/login');
  const productId = parseInt(req.query.productId, 10);
  const qty = parseInt(req.query.qty, 10);
  const diameter = req.query.diameter || '';
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).send('Product not found');
  const unitPrice = calculateUnitPrice(product.basePrice, qty);
  const totalPrice = +(unitPrice * qty).toFixed(2);
  res.render('order', {
    title: 'Place order',
    product,
    qty,
    diameter,
    unitPrice,
    totalPrice
  });
});

app.post('/order', (req, res) => {
  const { name, address, phone, diameter, productId, qty } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));
  const unit = calculateUnitPrice(product.basePrice, parseInt(qty, 10));
  const total = (unit * parseInt(qty, 10)).toFixed(2);

  res.send(`
    <h1>Order Received</h1>
    <p>Thank you, ${name}.</p>
    <p>Your order for <b>${product.name}</b> (${qty} pcs, tip profile ${diameter}) has been submitted.</p>
    <p>Total: $${total}</p>
    <p>We will contact you at ${phone}.</p>
    <p><a href="/">Return to home</a></p>
  `);
});

// Simple register page (stub)
app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ CueCube wholesale site running on port ' + PORT);
});
