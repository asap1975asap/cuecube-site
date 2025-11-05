// app.js
// Main server file for CueCube Wholesale website

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// --- Basic setup ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// --- Session configuration ---
app.use(
  session({
    secret: "cuecube_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// --- Demo users ---
const users = [
  { username: "demo", password: "123Qwerty123" },
  { username: "admin", password: "admin123" },
];

// --- Middleware to inject user info into templates ---
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// --- Routes ---

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = user;
    res.redirect("/products");
  } else {
    res.send("Invalid username or password.");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Products page
app.get("/products", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const products = [
    {
      id: 1,
      name: "CueCube Grey",
      price: 15,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
      type: "cube",
    },
    {
      id: 2,
      name: "CueCube Keychain",
      price: 15,
      images: [
        "/images/cue-cube-keychain-1.jpg",
        "/images/cue-cube-keychain-2.jpg",
        "/images/cue-cube-keychain-3.jpg",
      ],
      type: "keychain",
    },
  ];

  res.render("products", { products });
});

// Product detail page
app.get("/product/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const productId = parseInt(req.params.id);
  const products = [
    {
      id: 1,
      name: "CueCube Grey",
      price: 15,
      description: `
        The original CueCube is skillfully crafted in the USA using solid metal and silicon carbide for durability.
        Provides precise cue tip shaping and scuffing for ultimate ball control.
        Nickel (.418") radius on shaper side and scuffer side to hold chalk better.
      `,
      specifications: `
        Material: solid metal with silicone carbide to last a long time
        Color: Silver
        Profile: Nickel (.418")
        Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
        Net weight: 1.4 oz. (40 gr)
      `,
      images: [
        "/images/cue-cube-grey-1.jpg",
        "/images/cue-cube-grey-2.jpg",
        "/images/cue-cube-grey-3.jpg",
      ],
    },
    {
      id: 2,
      name: "CueCube Keychain",
      price: 15,
      description: `
        The original CueCube Keychain edition – crafted in the USA using solid metal and silicon carbide for durability.
        Combines cue tip shaper and scuffer with convenient keychain.
      `,
      specifications: `
        Material: solid metal with silicone carbide to last a long time
        Color: Silver
        Profile: Nickel (.418")
        Size: 1" x 1" x 0.6" (2.6 x 2.6 x 1.5 cm)
        Net weight: 1.6 oz. (46 gr)
      `,
      images: [
        "/images/cue-cube-keychain-1.jpg",
        "/images/cue-cube-keychain-2.jpg",
        "/images/cue-cube-keychain-3.jpg",
      ],
    },
  ];

  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).send("Product not found");
  res.render("product-detail", { product });
});

// Order page
app.get("/order", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("order");
});

app.post("/order", (req, res) => {
  const { name, address, phone } = req.body;
  res.send(
    `Thank you ${name}! Your order will be shipped to ${address}. We’ll contact you at ${phone}.`
  );
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CueCube wholesale site running at http://localhost:${PORT}`);
});
