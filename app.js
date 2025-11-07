const express = require('express');
const path = require('path');

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// hardcoded user
const DEMO_EMAIL = 'demo@cuecube.com';
const DEMO_PASSWORD = '123Qwerty123';

// products (оставили только 2)
const products = [
  {
    id: 0,
    name: 'CueCube - Grey',
    brand: 'CueCube',
    description: 'Original cue tip shaper and scuffer.',
    basePrice: 15.0,
    images: [
      '/images/cue-cube-353-grey-1.jpg',
      '/images/cue-cube-353-grey-2.jpg',
      '/images/cue-cube-353-grey-3.jpg'
    ],
    variants: [
      {
        code: '353',
        label: '.353 in (Dime)',
        images: [
          '/images/cue-cube-353-grey-1.jpg',
          '/images/cue-cube-353-grey-2.jpg',
          '/images/cue-cube-353-grey-3.jpg'
        ]
      },
      {
        code: '418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue-cube-418-grey-1.jpg',
          '/images/cue-cube-418-grey-2.jpg',
          '/images/cue-cube-418-grey-3.jpg'
        ]
      }
    ]
  },
  {
    id: 1,
    name: 'CueCube Keychain - Grey',
    brand: 'CueCube',
    description: 'CueCube with keychain ring.',
    basePrice: 15.0,
    images: [
      '/images/cue-cube-keychain-418-grey-1.jpg',
      '/images/cue-cube-keychain-418-grey-2.jpg',
      '/images/cue-cube-keychain-418-grey-3.jpg'
    ],
    variants: [
      {
        code: '353',
        label: '.353 in (Dime)',
        images: [
          '/images/cue-cube-keychain-418-grey-1.jpg',
          '/images/cue-cube-keychain-418-grey-2.jpg',
          '/images/cue-cube-keychain-418-grey-3.jpg'
        ]
      },
      {
        code: '418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue-cube-keychain-418-grey-1.jpg',
          '/images/cue-cube-keychain-418-grey-2.jpg',
          '/images/cue-cube-keychain-418-grey-3.jpg'
        ]
      }
    ]
  }
];

// small "session" for demo
function attachUser(req, res, next) {
  // render.com без сессий — будем смотреть на куку/header позднее,
  // а пока просто прокинем флаг в шаблон через locals
  res.locals.isLoggedIn = true;
  next();
}
app.use(attachUser);

// routes
app.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    // сразу после входа — на /products
    res.redirect('/products');
  } else {
    res.render('login', {
      title: 'Login',
      error: 'Invalid email or password'
    });
  }
});

app.get('/logout', (req, res) => {
  // ничего не чистим, просто на главную
  res.redirect('/');
});

// products list
app.get('/products', (req, res) => {
  res.render('products', { title: 'Products', products });
});

// product detail
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.render('product-detail', {
    title: product.name,
    product,
    selectedVariant: product.variants[0]
  });
});

// order page
app.get('/order', (req, res) => {
  const productId = parseInt(req.query.productId, 10);
  const qty = parseInt(req.query.qty, 10) || 10;
  const diameter = req.query.diameter || null;

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).send('Product not found');
  }

  const price = product.basePrice;
  const total = price * qty;

  res.render('order', {
    title: 'Order',
    product,
    qty,
    diameter,
    total
  });
});

app.post('/order', (req, res) => {
  const { name, address, phone, productId, qty, diameter } = req.body;
  const product = products.find(p => p.id === parseInt(productId, 10));

  const total = product ? product.basePrice * parseInt(qty, 10) : 0;

  res.send(`
    <h1>Order received</h1>
    <p>Thank you, ${name}.</p>
    <p>Product: ${product ? product.name : ''}</p>
    <p>Diameter: ${diameter || ''}</p>
    <p>Qty: ${qty}</p>
    <p>Total: $${total.toFixed(2)}</p>
    <p><a href="/">Return to home</a></p>
  `);
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('CueCube wholesale site running on port ' + PORT);
});
