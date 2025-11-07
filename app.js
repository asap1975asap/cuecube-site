const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'cuecube-demo-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// only two products
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
        images: [
          '/images/cue-cube-grey-353-1.jpg',
          '/images/cue-cube-grey-353-2.jpg',
          '/images/cue-cube-grey-353-3.jpg',
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
        images: [
          // пока фото для .353 нет, используем то, что есть
          '/images/cue-cube-keychain-1.jpg',
          '/images/cue-cube-keychain-2.jpg',
          '/images/cue-cube-keychain-3.jpg',
        ],
      },
      {
        code: '418',
        label: '.418 in (Nickel)',
        images: [
          '/images/cue-cube-keychain-418-1.jpg',
          '/images/cue-cube-keychain-418-2.jpg',
          '/images/cue-cube-keychain-418-3.jpg',
        ],
      },
    ],
    shortDesc: 'CueCube with keychain ring.',
  },
];

// price helper
function getUnitPrice(product, qty) {
  let price = product.prices[0].price;
  product.prices.forEach(function (p) {
    if (qty >= p.qty) {
      price = p.price;
    }
  });
  return price;
}

// home
app.get('/', function (req, res) {
  res.render('home', { isAuthenticated: !!req.session.user });
});

// login form
app.get('/login', function (req, res) {
  res.render('login', { error: null });
});

// login submit
app.post('/login', function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  // demo creds
  if (email === 'demo@cuecube.com' && password === '123Qwerty123') {
    req.session.user = { email: email };
    return res.redirect('/products');
  }

  return res.render('login', {
    error: 'Invalid email or password',
  });
});

// logout
app.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

// products list (protected)
app.get('/products', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('products', {
    isAuthenticated: true,
    products: products,
  });
});

// single product
app.get('/products/:id', function (req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const productId = parseInt(req.params.id, 10);
  const product = products.find(function (p) {
    return p.id === productId;
  });

  if (!product) {
    return res.status(404).send('Product not found');
  }

  const currentDiameter = product.diameters[0];

  res.render('product-detail', {
    isAuthenticated: true,
    product: product,
    currentDiameter: currentDiameter,
    qty: product.minQty,
  });
});

// order (GET) - show form
app.get('/order', function (req, res) {
  const productId = parseInt(req.query.productId, 10);
  const diameterCode = req.query.diameter;
  const qty = parseInt(req.query.qty, 10);

  const product = products.find(function (p) {
    return p.id === productId;
  });
  if (!product) {
    return res.status(404).send('Product not found');
  }

  const diameter = product.diameters.find(function (d) {
    return d.code === diameterCode;
  });
  if (!diameter) {
    return res.status(400).send('Diameter not found');
  }

  const unitPrice = getUnitPrice(product, qty);
  const total = unitPrice * qty;

  res.render('order', {
    isAuthenticated: true,
    product: product,
    qty: qty,
    diameter: diameter,
    unitPrice: unitPrice,
    total: total,
  });
});

// order (POST) - fake submit
app.post('/order', function (req, res) {
  const productId = parseInt(req.body.productId, 10);
  const diameterCode = req.body.diameter;
  const qty = parseInt(req.body.qty, 10);

  const product = products.find(function (p) {
    return p.id === productId;
  });
  if (!product) {
    return res.status(404).send('Product not found');
  }

  const diameter = product.diameters.find(function (d) {
    return d.code === diameterCode;
  });
  if (!diameter) {
    return res.status(400).send('Diameter not found');
  }

  const unitPrice = getUnitPrice(product, qty);
  const total = unitPrice * qty;

  const name = req.body.name;
  const company = req.body.company;
  const address = req.body.address;
  const phone = req.body.phone;

  res.send(
    '<h1>Order received</h1>' +
      '<p>Thank you, ' +
      name +
      '.</p>' +
      '<p>Product: ' +
      product.name +
      '</p>' +
      '<p>Diameter: ' +
      diameter.label +
      '</p>' +
      '<p>Quantity: ' +
      qty +
      '</p>' +
      '<p>Total: $' +
      total.toFixed(2) +
      '</p>' +
      '<p>We will contact you at ' +
      phone +
      '.</p>' +
      '<p><a href="/">Return to home</a></p>'
  );
});

// register (stub)
app.get('/register', function (req, res) {
  res.render('register');
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('CueCube wholesale site running on port ' + PORT);
});
