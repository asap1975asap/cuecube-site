// app.js
// CueCube Wholesale demo site

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Express setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Demo user
const users = [{ username: "demo@cuecube.com", password: "123Qwerty123" }];

// Product data
const PRICE_10 = 15.0;
const PRICE_50 = +(PRICE_10 * 0.85).toFixed(2);
const PRICE_100 = +(PRICE_50 * 0.85).toFixed(2);

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

The CueCube Keychain is crafted in the USA using solid metal and silicon carbide for durability.
It provides the same precise cue tip shaping and scuffing as the standard CueCube, with a keychain ring for portability.
Quick and easy-to-use, even during tournament play.

Product specifications:
Material: solid metal with silicone carbide
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.6 oz. (46 gr)`;

// Function to get product list
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

  const regular = ["Grey", "Blue", "Red", "Green", "Black"].map((color, i) => ({
    id: i,
    name: `CueCube - ${color}`,
    brand: "CueCube",
    shortDesc: "Original cue tip shaper and scuffer.",
    longDesc: longDescriptionCube,
    images: regularImages,
    minQty: 10,
    price10: PRICE_10,
    price50: PRICE_50,
    price100: PRICE_100,
  }));

  const keychains = ["Grey", "Blue", "Red", "Green", "Black"].map((color, i) => ({
    id: i + 5,
    name: `CueCube Keychain - ${color}`,
    brand: "CueCube",
    shortDesc: "CueCube with keychain ring — portable version.",
    longDesc: longDescriptionKeychain,
    images: keychainImages,
    minQty: 10,
    price10: PRICE_10,
    price50: PRICE_50,
    price100: PRICE_100,
  }));

  return [...regular, ...keychains];
}

// Middleware
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// Routes
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) return res.render("login", { error: "Invalid email or password" });
  req.session.user = { username: found.username };
  res.redirect("/products");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

app.get("/products", requireLogin, (req, res) => {
  res.render("products", { user: req.session.user, products: getProducts() });
});

app.get("/products/:id", requireLogin, (req, res) => {
  const products = getProducts();
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).send("Product not found");

  const defaultQty = 10;
  let unitPrice = product.price10;
  if (defaultQty >= 100) unitPrice = product.price100;
  else if (defaultQty >= 50) unitPrice = product.price50;
  const total = +(unitPrice * defaultQty).toFixed(2);

  res.render("product-detail", {
    user: req.session.user,
    product,
    defaultQty,
    unitPrice,
    total,
  });
});

app.get("/order", requireLogin, (req, res) => {
  res.render("order", { user: req.session.user });
});

app.post("/order", requireLogin, (req, res) => {
  const { name, address, phone, qty, productName, total } = req.body;
  res.send(`
    <h1>Order Received!</h1>
    <p>Thank you, ${name}. Your order for <b>${productName}</b> (${qty} pcs) has been submitted.</p>
    <p>Total: $${total}</p>
    <p>We'll contact you soon at ${phone}.</p>
    <a href="/">Return to home</a>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CueCube wholesale site running on port ${PORT}`);
});
