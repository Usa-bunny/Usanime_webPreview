const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const connectDB = require("./config/db");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 8080;

// ✅ Connect DB hanya sekali
connectDB();

// ✅ View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ✅ Session (MongoStore)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// ✅ Global middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin =
    (req.session.user?.akun?.role || req.session.user?.role) === "admin";
  next();
});

// ✅ Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/anime", require("./routes/animeRoutes"));
app.use("/history", require("./routes/historyRoutes"));

// ✅ Default redirect
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// ✅ RUN SERVER (WAJIB untuk Railway)
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

module.exports = app;
