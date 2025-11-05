// app.js
// CueCube Wholesale demo site (Express + EJS)

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

/* ---------- Express setup ---------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

/* ---------- Session ---------- */
app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

/* ---------- Demo user ---------- */
const users = [{ username: "demo@cuecube.com", password: "123Qwerty123" }];

/* ---------- Product data ---------- */
var PRICE_10 = 15.0;
var PRICE_50 = +(PRICE_10 * 0.85).toFixed(2);
var PRICE_100 = +(PRICE_50 * 0.85).toFixed(2);

var longDescriptionCube =
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

var longDescriptionKeychain =
  "Product features:\n\n" +
  "The CueCube Keychain is crafted in the USA using solid metal and silicon carbide for durability.\n" +
  "It provides the same precise cue tip shaping and scuffing as the standard CueCube, with a keychain ring for portability.\n" +
  "Quick and easy-to-use, even during tournament play.\n\n" +
  "Product specifications:\n" +
  "Material: solid metal with silicone carbide\n" +
  "Profile: Nickel (.418\")\n" +
  "Size: 1\" x 1\" x 0.6\" (2.6 x 2.6 x 1.5 cm)\n" +
  "Net weight: 1.6 oz. (46 gr)\n";

function getProducts() {
  var regularImages = [
    "/images/cue-cube-grey-1.jpg",
    "/images/cue-cube-grey-2.jpg",
    "/images/cue-cube-grey-3.jpg",
  ];

  var keychainImages = [
    "/images/cue-cube-keychain-1.jpg",
    "/images/cue-cube-keychain-2.jpg",
    "/images/cue-cube-keychain-3.jpg",
  ];

  var regularColors = ["Grey", "Blue", "Red", "Green", "Black"];
  var keychainColors = ["Grey", "Blue", "Red", "Green", "Black"];

  var regular = regularColors.map(function (color, i) {
    return {
      id: i,
      name: "CueCube - " + color,
      brand: "CueCube",
      shortDesc: "Original cue tip shaper and scuffer.",
      longDesc: longDescriptionCube,
      images: regularImages,
      minQty: 10,
      price10: PRICE_10,
      price50: PRICE_50,
      price100: PRICE_100,
    };
  });

  var keychains = keychainColors.map(function (color, i) {
    return {
      id: i + 5,
      name: "CueCube Keychain - " + color,
      brand: "CueCube",
      shortDesc: "CueCube with keychain ring — portable version.",
      longDesc: longDescriptionKeychain,
      images: keychainImages,
      minQty: 10,
      price10: PRICE_10,
      price50: PRICE_50,
      price100: PRICE_100,
    };
  });

  return regular.concat(keychains);
}

/* ---------- Middleware ---------- */
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

/* ---------- Routes ---------- */

// Home
app.get("/", function (req, res) {
  res.render("home", { user: req.session.user });
});

// Login
app.get("/login", function (req, res) {
  res.render("login", { error: null });
});

app.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var found = users.find(function (u) {
    return u.username === username && u.password === password;
  });

  if (!found) {
    return res.render("login", { error: "Invalid email or password" });
  }

  req.session.user = { username: found.username };
  res.redirect("/products");
});

// Logout
app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
});

// Products list
app.get("/products", requireLogin, function (req, res) {
  var products = getProducts();
  res.render("products", { user: req.session.user, products: products });
});

// Product detail
app.get("/products/:id", requireLogin, function (req, res) {
  var products = getProducts();
  var id = Number(req.params.id);
  var product = products.find(function (p) {
    return p.id === id;
  });

  if (!product) {
    return res.status(404).send("Product not found");
  }

  var defaultQty = 10;
  var unitPrice = product.price10;
  if (defaultQty >= 100) {
    unitPrice = product.price100;
  } else if (defaultQty >= 50) {
    unitPrice = product.price50;
  }
  var total = (unitPrice * defaultQty).toFixed(2);

  res.render("product-detail", {
    user: req.session.user,
    product: product,
    defaultQty: defaultQty,
    unitPrice: unitPrice,
    total: total,
  });
});

// Order page
app.get("/order", requireLogin, function (req, res) {
  res.render("order", { user: req.session.user });
});

// Order submit
app.post("/order", requireLogin, function (req, res) {
  var name = req.body.name;
  var address = req.body.address;
  var phone = req.body.phone;
  var qty = req.body.qty;
  var productName = req.body.productName;
  var total = req.body.total;

  var html = "";
  html += "<h1>Order Received!</h1>";
  html += "<p>Thank you, " + name + ".</p>";
  html +=
    "<p>Your order for <b>" +
    productName +
    "</b> (" +
    qty +
    " pcs) has been submitted.</p>";
  html += "<p>Total: $" + total + "</p>";
  html += "<p>We will contact you at " + phone + ".</p>";
  html += '<p><a href="/">Return to home</a></p>';

  res.send(html);
});

/* ---------- Start server ---------- */
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("CueCube wholesale site running at http://localhost:" + PORT);
});
