const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// hard coded users
const USERS = [
  {
    email: "demo@cuecube.com",
    password: "123Qwerty123"
  }
];

// hard coded products
// only 2 products as you asked
const PRODUCTS = [
  {
    id: "cue-cube-grey",
    name: "CueCube - Grey",
    brand: "CueCube",
    basePrice: 15.0,
    shortText: "Original cue tip shaper and scuffer.",
    variants: [
      {
        code: "418",
        label: ".418 in (Nickel)",
        images: [
            "/images/cue-cube-418-1.jpg",
            "/images/cue-cube-418-2.jpg",
            "/images/cue-cube-418-3.jpg"
        ]
      },
      {
        code: "353",
        label: ".353 in (Dime)",
        images: [
            "/images/cue-cube-353-1.jpg",
            "/images/cue-cube-353-2.jpg",
            "/images/cue-cube-353-3.jpg"
        ]
      }
    ],
    details: {
      features: [
        "The original Cue Cube is made in the USA using solid metal and silicon carbide.",
        "Shapes and scuffs the cue tip for better cue ball control.",
        "Automatic nickel (.418) or dime (.353) radius.",
        "Scuffer side fluffs the tip so it can hold chalk.",
        "Easy to use during match play."
      ],
      specs: [
        "Material: solid metal with silicone carbide",
        "Color: Grey",
        "Profile: Nickel (.418) or Dime (.353)",
        "Size: 1 x 1 x 0.6 in (2.6 x 2.6 x 1.5 cm)",
        "Net weight: 1.4 oz (40 g)"
      ]
    }
  },
  {
    id: "cue-cube-keychain-grey",
    name: "CueCube Keychain - Grey",
    brand: "CueCube",
    basePrice: 15.0,
    shortText: "CueCube with keychain ring.",
    variants: [
      {
        code: "418",
        label: ".418 in (Nickel)",
        images: [
            "/images/cue-cube-keychain-418-1.jpg",
            "/images/cue-cube-keychain-418-2.jpg",
            "/images/cue-cube-keychain-418-3.jpg"
        ]
      },
      {
        code: "353",
        label: ".353 in (Dime)",
        images: [
            "/images/cue-cube-keychain-418-1.jpg",
            "/images/cue-cube-keychain-418-2.jpg",
            "/images/cue-cube-keychain-418-3.jpg"
        ]
      }
    ],
    details: {
      features: [
        "Original Cue Cube with attached keychain.",
        "Made in the USA using solid metal and silicon carbide.",
        "Automatic nickel (.418) radius or dime (.353) radius.",
        "Scuffer side fluffs the tip so it can hold chalk.",
        "Works great for any pool player."
      ],
      specs: [
        "Material: solid metal with silicone carbide",
        "Color: Grey",
        "Profile: Nickel (.418) or Dime (.353)",
        "Size: 1 x 1 x 0.6 in (2.6 x 2.6 x 1.5 cm)",
        "Net weight: 1.6 oz (46 g)"
      ]
    }
  }
];

// auth middleware (very simple)
function requireAuth(req, res, next) {
  // Render free instance on Render does not keep sessions,
  // so we just let all pages show.
  // If you want to lock it, you can add real session here.
  next();
}

// routes
app.get("/", (req, res) => {
  res.render("home", { user: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const found = USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!found) {
    return res.render("login", { error: "Invalid email or password" });
  }
  // no real session, just redirect
  res.redirect("/products");
});

app.get("/products", requireAuth, (req, res) => {
  res.render("products", { products: PRODUCTS });
});

app.get("/products/:id", requireAuth, (req, res) => {
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).send("Product not found");
  }
  // default variant is first
  res.render("product-detail", {
    product,
    selectedCode: product.variants[0].code
  });
});

app.get("/order", requireAuth, (req, res) => {
  const productId = req.query.productId;
  const qty = parseInt(req.query.qty || "10", 10);
  const diameter = req.query.diameter || "";
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }

  // pricing logic
  let unitPrice = product.basePrice;
  if (qty >= 100) {
    unitPrice = +(product.basePrice * 0.72).toFixed(2);
  } else if (qty >= 50) {
    unitPrice = +(product.basePrice * 0.85).toFixed(2);
  }

  const total = +(unitPrice * qty).toFixed(2);

  res.render("order", {
    product,
    qty,
    unitPrice,
    total,
    diameter
  });
});

app.post("/order", requireAuth, (req, res) => {
  const { name, address, phone, productId, qty, diameter } = req.body;
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Product not found");
  }

  let unitPrice = product.basePrice;
  const q = parseInt(qty || "10", 10);
  if (q >= 100) {
    unitPrice = +(product.basePrice * 0.72).toFixed(2);
  } else if (q >= 50) {
    unitPrice = +(product.basePrice * 0.85).toFixed(2);
  }
  const total = +(unitPrice * q).toFixed(2);

  res.send(
    "<h1>Order received</h1>" +
      "<p>Thank you, " +
      name +
      ".</p>" +
      "<p>Your order for " +
      product.name +
      " (" +
      diameter +
      ") - " +
      q +
      " pcs was submitted.</p>" +
      "<p>Total: $" +
      total.toFixed(2) +
      "</p>" +
      '<p><a href="/">Go to home</a></p>'
  );
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("CueCube wholesale site running on port " + PORT);
});
