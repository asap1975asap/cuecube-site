const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// demo user
const users = [{ username: 'demo@cuecube.com', password: '123Qwerty123' }];

// invite codes
const inviteCodes = ['CUECUBE2025', 'WHOLESALE', 'VIPONLY'];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'cuecube-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// require login middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

/* ---------- LONG DESCRIPTIONS ---------- */

// regular CueCube
const longDescriptionCube = `Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides automatic nickel (.418") or dime (.353") radius on shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.
Cue Cubes are available in a variety of popular colors.
Colors available for Nickel profile: Black, Blue, Silver, Red, Pink, Green and White.
Colors available for Dime profile: Black, Blue and Silver.
Nickel Radius is the original Cue Cube profile.
Dime Radius provides a tighter radius for even more cue ball control and also prevents inadvertent scratching of the ferrule due to the tighter radius.
Quick and easy-to-use, even during tournament play.
Great for any Pool Player.

Cue Cube Product instructions:

Shaper Side: Apply short flicking upward strokes or hold steady while slowly turning cue. This provides precise tip shaping with an automatic radius, giving the player ultimate ball control.

Scuffer Side: Apply light back and forth strokes across the cue tip (similar to chalking). This fluffs the tip to hold chalk better and prevent miscues.

Product specifications:

Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.4 oz. (40 gr)`;

// keychain CueCube
const longDescriptionKeychain = `Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides an automatic nickel (.418") radius on the shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.
Cue Cubes with keychain are available in a variety of popular colors: Black, Blue, Silver, Red, Pink, Green and White.
Quick and easy-to-use, even during tournament play.
Great for any Pool Player.

Cue Cube Product instructions:

Shaper Side: Apply short flicking upward strokes or hold steady while slowly turning cue. This provides precise tip shaping with an automatic radius, giving the player ultimate ball control.

Scuffer Side: Apply light back and forth strokes across the cue tip (similar to chalking). This fluffs the tip to hold chalk better and prevent miscues.

Product specifications:

Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.6 oz. (46 gr)`;

/* ---------- PRICING ---------- */
const BASE_PRICE_10 = 15.0;                     // 10+
const PRICE_50 = +(BASE_PRICE_10 * 0.85).toFixed(2);   // 15% off
const PRICE_100 = +(PRICE_50 * 0.85).toFixed(2);       // another 15% off

// helper: pick unit price by quantity
function getUnitPriceForQty(qty) {
  if (qty >= 100) return PRICE_100;
  if (qty >= 50) return PRICE_50;
  return BASE_PRICE_10;
}

/* ---------- PRODUCTS ---------- */
function getProducts() {
  const regularImages = [
    '/images/cue-cube-grey-1.jpg',
    '/images/cue-cube-grey-2.jpg',
    '/images/cue-cube-grey-3.jpg'
  ];

  const keychainImages = [
    '/images/cue-cube-keychain-1.jpg',
    '/images/cue-cube-keychain-2.jpg',
    '/images/cue-cube-keychain-3.jpg'
  ];

  const regular = [
    { name: 'CueCube - Grey', images: regularImages },
    { name: 'CueCube - Blue', images: regularImages },
    { name: 'CueCube - Red', images: regularImages },
    { name: 'CueCube - Green', images: regularImages },
    { name: 'CueCube - Black', images: regularImages }
  ];

  const keychains = [
    { name: 'CueCube Keychain - Grey', images: keychainImages },
    { name: 'CueCube Keychain - Blue', images: keychainImages },
    { name: 'CueCube Keychain - Red', images: keychainImages },
    { name: 'CueCube Keychain - Green', images: keychainImages },
    { name: 'CueCube Keychain - Black', images: keychainImages }
  ];

  const regularMapped = regular.map((item, idx) => ({
    id: idx,
    brand: 'CueCube',
    shortDesc: 'Original CueCube tip shaper and scuffer.',
    longDesc: longDescriptionCube,
    price10: BASE_PRICE_10.toFixed(2),
    price50: PRICE_50.toFixed(2),
    price100: PRICE_100.toFixed(2),
    minQty: 10,
    ...item
  }));

  const keychainMapped = keychains.map((item, idx) => ({
    id: idx + 5,
    brand: 'CueCube',
    shortDesc: 'CueCube with keychain ring — portable version.',
    longDesc: longDescriptionKeychain,
    price10: BASE_PRICE_10.toFixed(2),
    price50: PRICE_50.toFixed(2),
    price100: PRICE_100.toFixed(2),
    minQty: 10,
    ...item
  }));

  return [...regularMapped, ...keychainMapped];
}

/* ---------- ROUTES ---------- */

// home
app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) {
    return res.render('login', { error: 'Invalid email or password' });
  }
  req.session.user = { username: found.username };
  res.redirect('/products');
});

// register
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { username, password, invite } = req.body;

  if (!inviteCodes.includes(invite)) {
    return res.render('register', { error: 'Invalid or expired invite code' });
  }

  const exists = users.find((u) => u.username === username);
  if (exists) {
    return res.render('register', { error: 'User already exists' });
  }

  users.push({ username, password });
  req.session.user = { username };
  res.redirect('/products');
});

// products list
app.get('/products', requireLogin, (req, res) => {
  const products = getProducts();
  res.render('products', { user: req.session.user, products });
});

// product detail
app.get('/products/:id', requireLogin, (req, res) => {
  const products = getProducts();
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).send('Product not found');

  // default qty is 10
  const defaultQty = 10;
  const unitPrice = getUnitPriceForQty(defaultQty);
  const total = +(unitPrice * defaultQty).toFixed(2);

  res.render('product-detail', {
    user: req.session.user,
    product,
    defaultQty,
    unitPrice,
    total
  });
});

// order page
app.get('/order', requireLogin, (req, res) => {
  const products = getProducts();
  const id = Number(req.query.productId);
  const qty = Number(req.query.qty) || 10;
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).send('Product not found');

  const unitPrice = getUnitPriceForQty(qty);
  const total = +(unitPrice * qty).toFixed(2);

  res.render('order', {
    user: req.session.user,
    product,
    qty,
    unitPrice,
    total
  });
});

// logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`CueCube wholesale site running at http://localhost:${PORT}`);
});
