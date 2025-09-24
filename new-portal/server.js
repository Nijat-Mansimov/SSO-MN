import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./src/config/passport.js";
import path from "path";
import { fileURLToPath } from "url";

import { router as userRoutes } from "./src/routes/userRoutes.js";
import { router as authRoutes } from "./src/routes/authRoutes.js";
import { router as adminRoutes } from "./src/routes/adminRoutes.js";
import { ssoRoutes } from "./src/routes/ssoRoutes.js";

import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { isAuthenticated } from "./src/middleware/authMiddleware.js";
import { isAdmin } from "./src/middleware/adminMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve public static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// Protected Pages using EJS
// --------------------

// Home page (authenticated users only)
app.get("/", isAuthenticated, (req, res) => {
  res.render("home", { 
    user: req.user,
    PORTAL_API: process.env.PORTAL_API || "http://172.22.61.7:3000/api",
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || "http://172.22.61.7:4000/api",
  });
});

// Admin dashboard (admin-only)
app.get("/admin", isAdmin, (req, res) => {
  res.render("admin", { 
    user: req.user,
    PORTAL_API: process.env.PORTAL_API || "http://172.22.61.7:3000/api",
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || "http://172.22.61.7:4000/api",
   });
});

// Login and Register (public)
app.get("/login", (req, res) => {
    res.render("login", {
      PORTAL_API: process.env.PORTAL_API || "http://172.22.61.7:3000/api"
  });
});

// --------------------
// API Routes
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/sso", ssoRoutes); // YENİ ƏLAVƏ

// Error Handling
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
