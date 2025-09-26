import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./src/config/passport.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// .env faylındakı dəyişənləri oxumaq üçün
dotenv.config();

// Router-lər
import { router as userRoutes } from "./src/routes/userRoutes.js";
import { router as authRoutes } from "./src/routes/authRoutes.js";
import { router as adminRoutes } from "./src/routes/adminRoutes.js";
import { ssoRoutes } from "./src/routes/ssoRoutes.js";

// Middleware-lər
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { isAuthenticated } from "./src/middleware/authMiddleware.js";
import { isAdmin } from "./src/middleware/adminMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Orta qat (Middleware)
// --------------------
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Frontend domenini göstər
  credentials: true // Cookie ilə işləmək üçün
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", // Sessiya açarı (mütləq .env-də saxla)
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Yalnız production-da HTTPS ilə işləsin
      httpOnly: true, // Cookie yalnız server tərəfindən oxunsun
      sameSite: "lax" // CSRF hücumlarına qarşı qoruma
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// --------------------
// EJS görünüş sistemi
// --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Statik fayllar (CSS, JS, şəkillər)
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// EJS ilə qorunan səhifələr
// --------------------
const portalApi = process.env.PORTAL_API || "http://localhost:3000/api";
const komekciApi = process.env.KOMEKCI_SISTEMI_API || "http://localhost:4000/api";

// Əsas səhifə (yalnız giriş edən istifadəçilər)
app.get("/", isAuthenticated, (req, res) => {
  res.render("home", { user: req.user, PORTAL_API: portalApi, KOMEKCI_SISTEMI_API: komekciApi });
});

// Admin paneli (yalnız admin üçün)
app.get("/admin", isAdmin, (req, res) => {
  res.render("admin", { user: req.user, PORTAL_API: portalApi, KOMEKCI_SISTEMI_API: komekciApi });
});

// Login səhifəsi (hamı üçün açıq)
app.get("/login", (req, res) => {
  res.render("login", { PORTAL_API: portalApi });
});

// --------------------
// API marşrutları
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/sso", ssoRoutes);

// --------------------
// Xəta idarəetməsi
// --------------------
app.use(errorHandler);

// --------------------
// Server işə düşməsi
// --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server işə düşdü: http://localhost:${PORT}`);
});
