// app.js
// CueCube Wholesale demo site for Render

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/* ---------- basic setup ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

/* ---------- session ---------- */
app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

/* ---------- demo user ---------- */
const users = [{ username: "demo@cuecube.com", password: "123Qwerty123" }];

/* ---------- long descriptions ---------- */
const longDescriptionCube = `Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides automatic nickel (.418") radius on shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.
Quick and easy-to-use, even during tournament play.
Great for any Pool Player.

Product specifications:
Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.4 oz. (40 gr)`;

const longDescriptionKeychain = `Product features:

The original Cue Cube Keychain is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Includes keychain ring so you can always keep it with you.
Quick and easy-to-use, even during tournament play.

Product specifications:
Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.6 oz. (46 gr)`;

/* ---------- pricing ---------- */
const PRICE_10 = 15.0;
const PRICE_50 = +(PRICE_10 * 0.85).toFixed(2);
const PRICE_100 = +(PRICE_50 * 0.85).toFixed(2);

/* ---------- products builder ---------- */
function getProducts() {
  const regularImages = [
    "/images/cue-cube-grey-1.jpg",
    "/images/cue-cube-grey-2.jpg",
    "/images/cue-cube-grey-3.jpg",
  ];

  const keychainImages = [
    "/images/cue-cube-keychain-1.jpg",
    "/images/cue-cube-keychain-2.jpg",
    "/images/cue-cube-keychain-3.jpg",
  ];

  const regular = [
    { name: "CueCube - Grey" },
    { name: "CueCube - Blue" },
    { name: "CueCube - Red" },
    { name: "CueCube - Green" },
    { name: "CueCube - Black" },
  ].map((item, idx) => ({
    id: idx,
    brand: "CueCube",
    shortDesc: "Original CueCube tip shaper and scuffer.",
    images: regularImages,
    longDesc: longDescriptionCube,
    minQty: 10,
    price10: PRICE_10,
    price50: PRICE_50,
    price100: PRICE_100,
    ...item,
  }));

  const keychains = [
    { name: "CueCube Keychain - Grey" },
    { name: "CueCube Keychain - Blue" },
    { name: "CueCube Keychain - Red" },
    { name: "CueCube Keychain - Green" },
    { name: "CueCube Keychain - Black" },
  ].map((item, idx) => ({
    id: idx + 5,
    brand: "CueCube",
    shortDesc: "CueCube with keychain ring — portable version.",
    images: keychainImages,
    longDesc: longDescriptionKeychain,
    minQty: 10,
    price10: PRICE_10,
    price50: PRICE_50,
    price100: PRICE_100,
    ...item,
  }));

  return [...regular, ...keychains];
}

/* ---------- helpers ---------- */
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function getUnitPriceByQty(product, qty) {
  if (qty >= 100) return product.price100;
  if (qty >= 50) return product.price50;
  return product.price10;
}

/* ---------- routes ---------- */

// home
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user });
});

// login
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) {
    return res.render("login", { error: "Invalid email or password" });
  }
  req.session.user = { username: found.username };
  res.redirect("/products");
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// products list
app.get("/products", requireLogin, (req, res) => {
  const products = getProducts();
  res.render("products", { user: req.session.user, products });
});

// product detail
app.get("/products/:id", requireLogin, (req, res) => {
  const products = getProducts();
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).send("Product not found");
  }

  const defaultQty = 10;
  const unitPrice = getUnitPriceByQty(product, defaultQty);
  const total = +(unitPrice * defaultQty).toFixed(2);

  res.render("product-detail", {
    user: req.session.user,
    product,
    defaultQty,
    unitPrice,
    total,
  });
});

// order page (GET from product-detail)
app.get("/order", requireLogin, (req, res) => {
  const products = getProducts();

  const productId = Number(req.query.productId);
  let qty = Number(req.query.qty) || 10;
  if (qty < 10) qty = 10;

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }

  const unitPrice = getUnitPriceByQty(product, qty);
  const total = +(unitPrice * qty).toFixed(2);

  res.render("order", {
    user: req.session.user,
    product,
    qty,
    unitPrice,
    total,
  });
});

/* ---------- start server (Render) ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CueCube wholesale site running at http://localhost:${PORT}`);
});
