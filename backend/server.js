require("dotenv").config(); // اطلب قيمة من ملف env
const express = require("express");//
const cors = require("cors");// نستخدمه للسماح لفرونت اند بالوصول
const helmet = require("helmet");// للحماية من الاختراق
const { rateLimit } = require("express-rate-limit");//للحد من عدد الطلبات

if (!process.env.JWT_SECRET) {//نتحقق من وجود مفتاح التشفير
  throw new Error("JWT_SECRET is missing");
}
require("./db");//اتصال بقاعدة البيانات
const app = express();//

const authRoutes = require("./routes/auth");//مسارات تسجيل الدخول
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const profileRoutes = require("./routes/profileRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
app.use(helmet());//
app.use(express.json());//

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://localhost:4173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";

// Safe LAN development origin validator (only active in non-production development mode)
const isAllowedLanOrigin = (origin) => {
  if (!isDev || !origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return (
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isAllowedLanOrigin(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use("/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running",
  });
});
/////////////////////////////
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);
app.use("/profile", profileRoutes);
app.use("/reviews", reviewRoutes);
//////////////////////////////////



app.use((err, req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} 🚀`);
  });
}

module.exports = app;
