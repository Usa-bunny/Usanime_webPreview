const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const connectDB = require("./config/db");
const MongoStore = require("connect-mongo");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const app = express();
const port = process.env.PORT || 3000;

// Import routes
const authRoutes = require("./routes/authRoutes");
const animeRoutes = require("./routes/animeRoutes");
const historyRoutes = require("./routes/historyRoutes");

// 🔗 Koneksi ke database
connectDB();

// 🧩 Setup view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 🧩 Middleware parsing form dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🧩 Setup folder static
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 🧩 Setup session (gunakan MongoStore untuk kestabilan)
const clientPromise = mongoose.connect(process.env.MONGO_URI).then(m => m.connection.getClient());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        clientPromise
    }),
    cookie: { maxAge: 1000 * 60 * 60 }
}));

// 🧩 Middleware global untuk EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = (req.session.user?.akun?.role || req.session.user?.role) === "admin";
  next();
});

// 🧩 Routes utama
app.use("/auth", authRoutes);
app.use("/anime", animeRoutes);
app.use("/history", historyRoutes);

// 🧩 Default redirect
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

// 🧩 Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
