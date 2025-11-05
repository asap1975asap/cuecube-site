// app.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// demo user
const users = [{ username: "demo@cuecube.com", password: "123Qwerty123" }];

// prices
const PRICE_10 = 15.0;
const PRICE_50 = +(PRICE_10 * 0.85).toFixed(2);
const PRICE_100 = +(PRICE_50 * 0.85).toFixed(2);

// text
const longDescriptionCube =
  "Product features:\n\n" +
  "The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.\n" +
  "It provides a precise cue tip shaping and scuffing to give players ultimate ball control.\n" +
  "Unique design provides automatic nickel (.418\") radius on shaper side.\n" +
  "Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.\n" +
  "Quick and easy-to-use, even during tournament play.\n" +
  "Great for any Pool Player.\n\n" +
  "Product specifications:\n" +
  "Material: solid metal with silicone carbide to last a long time\n" +
  "Color: Silver\n" +
  "Profile: Nickel (.418\")\n" +
  "Size: 1\" x 1\" x 0.6\" (2.6 x 2.6 x 1.5 cm)\n" +
  "Net weight: 1.4 oz. (40 gr)\n";

const longDescriptionKeychain =
  "Product features:\n\n" +
  "The original Cue Cube Keychain is skillfully crafted in the USA using solid metal and silicon carbide for durability.\n" +
  "It provides a precise cue tip shaping and scuffing to give players ultimate ball control.\n" +
  "Includes keychain ring for easy carry.\n\n" +
  "Product specifications:\n" +
  "Material: solid metal with silicone carbide to last a long time\n" +
  "Color: Silver\n" +
  "Profile: Nickel (.418\")\n" +
  "Size: 1\" x 1\" x 0.6\" (2.6 x 2.6 x 1.5 cm)\n" +
  "Net weight: 1.6 oz. (46 gr)\n";

// build products
function getProducts() {
  const regImgs = [
    "/images/cue-cube-grey-1.jpg",
    "/images/cue-cube-grey-2.jpg",
    "/images/cue-cube-grey-3.jpg",
  ];
  const keyImgs = [
    "/images/cue-cube-keychain-1.jpg",
    "/images/cue-cube-keychain-2.jpg",
    "/images/cue-cube-keychain-3.jpg",
  ];

  const regular = ["Grey", "Blue", "Red", "Green", "Black"].map(function (
    color,
    i
  ) {
    return {
      id: i,
      name: "CueCube - " + color,
      brand: "CueCube",
      shortDesc: "Original cue tip shaper and scuffer.",
      longDesc: longDescriptionCube,
      images: regImgs,
      minQty: 10,
      price10: PRICE_10,
      price50: PRICE_50,
      price100: PRICE_100,
    };
  });

  const keychains = ["Grey", "Blue", "Red", "Green", "Black"].map(function (
    color,
    i
  ) {
    return {
      id: i + 5,
      name: "CueCube Keychain - " + color,
      brand: "CueCube",
      shortDesc: "CueCube with keychain ring.",
      longDesc: longDescriptionKeychain,
      images: keyImgs,
      minQty: 10,
      price10: PRICE_10,
      price50: PRICE_50,
      price100: PRICE_100,
    };
  });

  return regular.concat(keychains);
}

// helper
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

// routes
app.get("/", function (req, res) {
  res.render("home", { user: req.session.user });
});

app.get("/login", function (req, res) {
  res.render("login", { error: null });
});

app.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var user = users.find(function (u) {
    return u.username === username && u.password === password;
  });
  if (!user) {
    return res.render("login", { error: "Invalid email or password" });
  }
  req.session.user = { username: user.username };
  res.redirect("/products");
});

app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

app.get("/products", requireLogin, function (req, res) {
  res.render("products", {
    user: req.session.user,
    products: getProducts(),
  });
});

app.get("/products/:id", requireLogin, function (req, res) {
  var products = getProducts();
  var product = products.find(function (p) {
    return p.id === Number(req.params.id);
  });
  if (!product) return res.status(404).send("Product not found");

  var defaultQty = 10;
  var unitPrice = product.price10;
  if (defaultQty >= 100) unitPrice = product.price100;
  else if (defaultQty >= 50) unitPrice = product.price50;
  var total = (unitPrice * defaultQty).toFixed(2);

  res.render("product-detail", {
    user: req.session.user,
    product: product,
    defaultQty: defaultQty,
    unitPrice: unitPrice,
    total: total,
  });
});

// order page (GET from ?productId=..&qty=..)
app.get("/order", requireLogin, function (req, res) {
  var products = getProducts();
  var productId = req.query.productId ? Number(req.query.productId) : null;
  var qty = req.query.qty ? Number(req.query.qty) : 0;

  var product = null;
  if (productId !== null) {
    product = products.find(function (p) {
      return p.id === productId;
    });
  }

  var unitPrice = product ? product.price10 : 0;
  if (product && qty >= 100) unitPrice = product.price100;
  else if (product && qty >= 50) unitPrice = product.price50;

  var total = product ? (unitPrice * qty).toFixed(2) : "0.00";

  res.render("order", {
    user: req.session.user,
    product: product,
    qty: qty,
    unitPrice: unitPrice,
    total: total,
  });
});

app.post("/order", requireLogin, function (req, res) {
  var name = req.body.name;
  var address = req.body.address;
  var phone = req.body.phone;
  var productName = req.body.productName;
  var qty = req.body.qty;
  var total = req.body.total;

  res.send(
    "<h1>Order received</h1>" +
      "<p>Thank you, " +
      name +
      ".</p>" +
      "<p>Your order for <b>" +
      productName +
      "</b> (" +
      qty +
      " pcs) has been submitted.</p>" +
      "<p>Total: $" +
      total +
      "</p>" +
      '<p><a href="/">Back to home</a></p>'
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("CueCube wholesale site running on port " + PORT);
});
