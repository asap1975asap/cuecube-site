// app.js
// CueCube Wholesale demo site (for Render)

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// view + static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// sessions
app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// demo users
const users = [
  { username: "demo@cuecube.com", password: "123Qwerty123" },
];

// helper to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// home
app.get("/", (req, res) => {
  res.render("home", { user: req.session.user });
});

// login (GET)
app.get("/login", (req, res) => {
  // IMPORTANT: pass error even if null, otherwise EJS can fail
  res.render("login", { error: null });
});

// login (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!found) {
    // re-render with error message
    return res.render("login", { error: "Invalid email or password" });
  }

  req.session.user = { username: found.username };
  res.redirect("/products");
});

// logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// products list
app.get("/products", requireLogin, (req, res) => {
  const products = [
    {
      id: 1,
      name: "CueCube - Grey",
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
      desc: "Original CueCube tip shaper and scuffer.",
    },
    {
      id: 2,
      name: "CueCube - Blue",
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
      desc: "Same tool in blue finish.",
    },
    {
      id: 3,
      name: "CueCube Keychain - Grey",
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-keychain-1.jpg",
        "/images/cue-cube-keychain-2.jpg",
        "/images/cue-cube-keychain-3.jpg",
      ],
      desc: "CueCube with keychain ring for players on the go.",
    },
  ];

  res.render("products", { user: req.session.user, products });
});

// product detail
app.get("/products/:id", requireLogin, (req, res) => {
  const products = [
    {
      id: 1,
      name: "CueCube - Grey",
      brand: "CueCube",
      minQty: 10,
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
      longDesc: `Product features:

The original Cue Cube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Unique design provides automatic nickel (.418") radius on shaper side.
Scuffer side lightly fluffs up the tip to better hold chalk and prevent miscues.

Product specifications:
Material: solid metal with silicone carbide to last a long time
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.4 oz. (40 gr)`,
    },
    {
      id: 2,
      name: "CueCube - Blue",
      brand: "CueCube",
      minQty: 10,
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
      longDesc: `Same CueCube tool in blue finish.`,
    },
    {
      id: 3,
      name: "CueCube Keychain - Grey",
      brand: "CueCube",
      minQty: 10,
      price10: 15.0,
      price50: 12.75,
      price100: 10.84,
      images: [
        "/images/cue-cube-keychain-1.jpg",
        "/images/cue-cube-keychain-2.jpg",
        "/images/cue-cube-keychain-3.jpg",
      ],
      longDesc: `Product features:

The original Cue Cube Keychain is skillfully crafted in the USA using solid metal and silicon carbide for durability.
It provides a precise cue tip shaping and scuffing to give players ultimate ball control.
Includes keychain ring for easy carry.

Product specifications:
Material: solid metal with silicone carbide
Color: Silver
Profile: Nickel (.418")
Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
Net weight: 1.6 oz. (46 gr)`,
    },
  ];

  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);
  if (!product) return res.status(404).send("Product not found");

  // default calc on page
  const defaultQty = 10;
  const unitPrice =
    defaultQty >= 100
      ? product.price100
      : defaultQty >= 50
      ? product.price50
      : product.price10;
  const total = (unitPrice * defaultQty).toFixed(2);

  res.render("product-detail", {
    user: req.session.user,
    product,
    defaultQty,
    unitPrice,
    total,
  });
});

// order page
app.get("/order", requireLogin, (req, res) => {
  res.render("order", {
    user: req.session.user,
    product: null,
    qty: 0,
    unitPrice: 0,
    total: 0,
  });
});

// start server (Render uses process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CueCube wholesale site running at http://localhost:${PORT}`);
});
