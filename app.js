// app.js
const express = require('express');
const path = require('path');

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// to read form bodies
app.use(express.urlencoded({ extended: false }));

// very simple auth flag (demo only)
let isAuthenticated = false;

// products data (2 items)
const products = [
  {
    id: 0,
    name: 'CueCube - Grey',
    brand: 'CueCube',
    basePrice: 15.0,
    images: [
      '/images/cue-cube-grey-1.jpg',
      '/images/cue-cube-grey-2.jpg',
      '/images/cue-cube-grey-3.jpg'
    ],
    description: 'Original cue tip shaper and scuffer.',
    profiles: ['.353 in (Dime)', '.418 in (Nickel)']
  },
  {
    id: 1,
    name: 'CueCube Keychain - Grey',
    brand: 'CueCube',
    basePrice: 15.0,
    images: [
      '/images/cue-cube-keychain-1.jpg',
      '/images/cue-cube-keychain-2.jpg',
      '/images/cue-cube-keychain-3.jpg'
    ],
    description: 'CueCube with keychain ring.',
    profiles: ['.353 in (Dime)', '.418 in (Nickel)']
  }
];

// middleware to protect pages
function requireAuth(req, res, next) {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }
  next();
}

// HOME
app.get('/', (req, res) => {
  res.render('home', {
    title: 'Home',
    loggedIn: isAuthenticated
  });
});

// LOGIN (GET)
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    errorMessage: '',
    loggedIn: isAuthenticated
  });
});

// LOGIN (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // demo credentials
  const okEmail = 'demo@cuecube.com';
  const okPassword = '123Qwerty123';

  if (email === okEmail && password === okPassword) {
    isAuthenticated = true;
    return res.redirect('/products');
  }

  return res.render('login', {
    title: 'Login',
    errorMessage: 'Invalid email or password.',
    loggedIn: false
  });
});

// LOGOUT
app.get('/logout', (req, res) => {
  isAuthenticated = false;
  res.redirect('/');
});

// PRODUCTS LIST (protected)
app.get('/products', requireAuth, (req, res) => {
  res.render('products', {
    title: 'Products',
    products,
    loggedIn: isAuthenticated
  });
});

// PRODUCT DETAIL (protected)
app.get('/products/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).send('Product not found');
  }

  res.render('product-detail', {
    title: product.name,
    product,
    loggedIn: isAuthenticated
  });
});

// ORDER (protected)
app.post('/order', requireAuth, (req, res) => {
  const { productId, qty, profile } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(400).send('Bad request');
  }

  const quantity = Math.max(parseInt(qty, 10) || 10, 10);
  const total = product.basePrice * quantity;

  res.render('order', {
    title: 'Order',
    productName: product.name,
    quantity,
    total,
    profile,
    loggedIn: isAuthenticated
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('CueCube wholesale site running on port ' + PORT);
});
