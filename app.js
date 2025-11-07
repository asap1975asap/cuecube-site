// app.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// ----- view + static -----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// ----- session -----
app.use(
  session({
    secret: "cuecube-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// ----- fake user -----
const DEMO_USER = {
  email: "demo@cuecube.com",
  password: "123Qwerty123",
};

// ----- products (2 items only) -----
const products = [
  {
    id: 0,
    name: "CueCube - Grey",
    brand: "CueCube",
    description:
      "Original cue tip shaper and scuffer made in the USA. Durable metal body with silicon carbide.",
    minQty: 10,
    prices: {
      base: 15.0,
      fifty: 12.75,
      hundred: 10.84,
    },
    variants: [
      {
        code: ".418 in (Nickel)",
        diameter: ".418",
        images: [
          "/images/cue_cube_418_grey_1.jpg",
          "/images/cue_cube_418_grey_2.jpg",
          "/images/cue_cube_418_grey_3.jpg",
        ],
      },
      {
        code: ".353 in (Dime)",
        diameter: ".353",
        images: [
          "/images/cue_cube_353_grey_1.jpg",
          "/images/cue_cube_353_grey_2.jpg",
          "/images/cue_cube_353_grey_3.jpg",
        ],
      },
    ],
  },
  {
    id: 1,
    name: "CueCube Keychain - Grey",
    brand: "CueCube",
    description:
      "Keychain version of the original CueCube tip tool. Same shaping and scuffing surface.",
    minQty: 10,
    prices: {
      base: 15.0,
      fifty: 12.75,
      hundred: 10.84,
    },
    variants: [
      {
        code: ".418 in (Nickel)",
        diameter: ".418",
        images: [
          "/images/cue_cube_418_keychain_grey_1.jpg",
          "/images/cue_cube_418_keychain_grey_2.jpg",
          "/images/cue_cube_418_keychain_grey_3.jpg",
        ],
      },
      {
        code: ".353 in (Dime)",
        diameter: ".353",
        // пока фото те же, что и для .418
        images: [
          "/images/cue_cube_418_keychain_grey_1.jpg",
          "/images/cue_cube_418_keychain_grey_2.jpg",
          "/images/cue_cube_418_keychain_grey_3.jpg",
        ],
      },
    ],
  },
];

// ----- helper -----
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

function calcTotal(priceMap, qty) {
  const q = Number(qty) || 0;
  if (q >= 100) return (priceMap.hundred * q).toFixed(2);
  if (q >= 50) return (priceMap.fifty * q).toFixed(2);
  return (priceMap.base * q).toFixed(2);
}

// ===== ROUTES =====

// home
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user || null });
});

// login page
app.get("/login", (req, res) => {
  res.render("login", {
    error: null,
    email: "",
  });
});

// login submit
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (
    email &&
    password &&
    email.toLowerCase() === DEMO_USER.email.toLowerCase() &&
    password === DEMO_USER.password
  ) {
    req.session.user = { email: DEMO_USER.email };
    return res.redirect("/products");
  }

  return res.render("login", {
    error: "Invalid email or password",
    email: email || "",
  });
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// products list (protected)
app.get("/products", requireAuth, (req, res) => {
  res.render("products", {
    user: req.session.user,
    products,
  });
});

// product detail (protected)
app.get("/products/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).send("Product not found");
  }

  const variantIndex = parseInt(req.query.variant || "0", 10);
  const safeVariantIndex =
    variantIndex >= 0 && variantIndex < product.variants.length
      ? variantIndex
      : 0;

  res.render("product-detail", {
    user: req.session.user,
    product,
    activeVariantIndex: safeVariantIndex,
  });
});

// order page (protected)
app.get("/order", requireAuth, (req, res) => {
  const productId = parseInt(req.query.productId, 10);
  const qty = parseInt(req.query.qty, 10) || 0;
  const diameter = req.query.diameter || "";
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  const total = calcTotal(product.prices, qty);

  res.render("order", {
    user: req.session.user,
    product,
    qty,
    diameter,
    total,
  });
});

// order submit (protected)
app.post("/order", requireAuth, (req, res) => {
  const { productId, qty, name, address, phone, diameter } = req.body;
  const product = products.find((p) => p.id === parseInt(productId, 10));

  if (!product) {
    return res.status(400).send("Product not found");
  }

  const pickedDiameter = diameter || product.variants[0].diameter;
  const total = calcTotal(product.prices, qty);

  // simple thanks html
  res.send(
    "<h1>Order received</h1>" +
      "<p>Thank you, " +
      name +
      ".</p>" +
      "<p>Product: <b>" +
      product.name +
      "</b></p>" +
      "<p>Diameter: " +
      pickedDiameter +
      "</p>" +
      "<p>Quantity: " +
      qty +
      "</p>" +
      "<p>Total: $" +
      total +
      "</p>" +
      '<p><a href="/">Return to home</a></p>'
  );
});

// register stub
app.get("/register", (req, res) => {
  res.render("register");
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("CueCube wholesale site running on port " + PORT);
});
