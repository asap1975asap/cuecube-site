const express = require("express");
const path = require("path");

const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// demo user
const DEMO_USER = {
  email: "demo@cuecube.com",
  password: "123Qwerty123"
};

// products data (2 items only)
const PRODUCTS = [
  {
    id: 0,
    name: "CueCube - Grey",
    brand: "CueCube",
    priceFrom: "10.84",
    description: "Original cue tip shaper and scuffer.",
    images: [
      "/images/cue-cube-grey-1.jpg",
      "/images/cue-cube-grey-2.jpg",
      "/images/cue-cube-grey-3.jpg"
    ]
  },
  {
    id: 1,
    name: "CueCube Keychain - Grey",
    brand: "CueCube",
    priceFrom: "10.84",
    description: "CueCube with keychain ring.",
    images: [
      "/images/cue-cube-keychain-1.jpg",
      "/images/cue-cube-keychain-2.jpg",
      "/images/cue-cube-keychain-3.jpg"
    ]
  }
];

// HOME
app.get("/", (req, res) => {
  res.render("home", { title: "CueCube Wholesale" });
});

// LOGIN FORM
app.get("/login", (req, res) => {
  res.render("login", { title: "Dealer Login", error: "" });
});

// LOGIN SUBMIT
app.post("/login", (req, res) => {
  const email = req.body.email || "";
  const password = req.body.password || "";

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    return res.redirect("/products");
  }

  return res.status(401).render("login", {
    title: "Dealer Login",
    error: "Invalid email or password."
  });
});

// PRODUCTS LIST
app.get("/products", (req, res) => {
  res.render("products", {
    title: "Product Catalog",
    products: PRODUCTS
  });
});

// PRODUCT DETAIL
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.render("product-detail", {
    title: product.name,
    product
  });
});

// ORDER (fake)
app.get("/order", (req, res) => {
  const productId = parseInt(req.query.productId || "0", 10);
  const qty = parseInt(req.query.qty || "10", 10);
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return res.status(400).send("Invalid product");
  }

  const unitPrice = 15.0;
  const total = unitPrice * qty;

  res.render("order", {
    title: "Order received",
    product,
    qty,
    unitPrice,
    total
  });
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("CueCube wholesale site running on port " + PORT);
});
