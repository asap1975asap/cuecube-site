const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'cuecube-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// hardcoded products: only 2 as you asked
const products = [
  {
    id: 0,
    name: 'CueCube - Grey',
    brand: 'CueCube',
    minQty: 10,
    prices: [
      { qty: 10, price: 15.0 },
      { qty: 50, price: 12.75 },
      { qty: 100, price: 10.84 },
    ],
    diameters: [
      {
        code: '353',
        label: '.353 in (Dime)',
        // you can replace these names with your real 353 images later
        images: [
          '/images/cue-cube-grey-1.jpg',
          '/images/cue-cube-grey-2.jpg',
          '/images/cue-cube-grey-3.jpg',
        ],
      },
      {
        code: '418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue-cube-grey-418-1.jpg',
          '/images/cue-cube-grey-418-2.jpg',
          '/images/cue-cube-grey-418-3.jpg',
        ],
      },
    ],
    shortDesc: 'Original cue tip shaper and scuffer.',
  },
  {
    id: 1,
    name: 'CueCube Keychain - Grey',
    brand: 'CueCube',
    minQty: 10,
    prices: [
      { qty: 10, price: 15.0 },
      { qty: 50, price: 12.75 },
      { qty: 100, price: 10.84 },
    ],
    diameters: [
      {
        code: '353',
        label: '.353 in (Dime)',
        // temporary use 418 keychain images for 353 too
        images: [
          '/images/cue-cube-keychain-1.jpg',
          '/images/cue-cube-keychain-2.jpg',
          '/images/cue-cube-keychain-3.jpg',
        ],
      },
      {
        code: '418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue-cube-keychain-1.jpg',
          '/images/cue-cube-keychain-2.jpg',
          '/images/cue-cube-keychain-3.jpg',
        ],
      },
    ],
    shortDesc: 'CueCube with keychain ring.',
  },
];

// helper to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// home
app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// login form
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// login submit
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // demo credentials
  if (email === 'demo@cuecube.com' && password === '123Qwerty123') {
    req.session.user = { email: email };
    return res.redirect('/products');
  }

  return res.render('login', { error: 'Invalid email or password' });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// products list
app.get('/products', requireLogin, (req, res) => {
  res.render('products', {
    user: req.session.user,
    products: products,
  });
});

// product details
app.get('/products/:id', requireLogin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).send('Product not found');
  }

  // default diameter is the first
  const selectedDiameter = product.diameters[0];

  res.render('product-detail', {
    user: req.session.user,
    product: product,
    selectedDiameter: selectedDiameter,
  });
});

// order page (GET from "Place order" button)
app.get('/order', requireLogin, (req, res) => {
  const productId = parseInt(req.query.productId, 10);
  const qty = parseInt(req.query.qty, 10) || 10;
  const diameter = req.query.diameter || '418';

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send('Product not found');
  }

  res.render('order', {
    user: req.session.user,
    product: product,
    qty: qty,
    diameter: diameter,
  });
});

// order submit
app.post('/order', requireLogin, (req, res) => {
  const { name, address, phone, productId, qty, diameter } = req.body;

  const product = products.find((p) => p.id === parseInt(productId, 10));
  if (!product) {
    return res.status(404).send('Product not found');
  }

  // simple thank-you page
  res.send(
    '<h1>Order received</h1>' +
      '<p>Product: ' +
      product.name +
      '</p>' +
      '<p>Quantity: ' +
      qty +
      '</p>' +
      '<p>Diameter: ' +
      diameter +
      '</p>' +
      '<p>We will contact you at: ' +
      phone +
      '</p>' +
      '<p><a href="/products">Back to products</a></p>'
  );
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('CueCube wholesale site running on port ' + PORT);
});
