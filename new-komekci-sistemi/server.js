import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./src/config/passport.js";
import session from "express-session";


import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { router as authRoutes } from "./src/routes/authRoutes.js";
import { router as userRoutes } from "./src/routes/userRoutes.js";
import {router as managerRoutes} from "./src/routes/managerRoutes.js"
import {router as technicianRoutes} from "./src/routes/technicianRoutes.js"
import {router as adminRoutes} from "./src/routes/adminRoutes.js"
import { ssoRoutes } from "./src/routes/ssoRoutes.js";
import { isAuthenticated } from "./src/middleware/authMiddleware.js";
import { isManager } from "./src/middleware/managerMiddleware.js";
import { isTechnician } from "./src/middleware/technicianMiddleware.js";
import { isAdmin } from "./src/middleware/adminMiddleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTAL_API = "https://portal.mnbq.local/api" 
const KOMEKCI_SISTEMI_API = "https://portal.mnbq.local:4000/api" 

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

// API ENDPOINTS
app.use("/api/auth/", authRoutes)
app.use("/api/users/", userRoutes)
app.use("/api/managers/", managerRoutes)
app.use("/api/technicians/", technicianRoutes)
app.use("/api/admins", adminRoutes)
app.use("/api/sso", ssoRoutes); // YENİ ƏLAVƏ
// app.use("/api/sso/create/user",)

// Login and Register (public)
app.get("/login", (req, res) => {
  res.render("login", {
    PORTAL_API: process.env.PORTAL_API || PORTAL_API,
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || KOMEKCI_SISTEMI_API,
  });
});

app.get("/user-home", isAuthenticated, (req, res) => {
  res.render("user-home", {
    PORTAL_API: process.env.PORTAL_API || PORTAL_API,
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || KOMEKCI_SISTEMI_API,
  });
});

app.get("/manager-home", isManager, (req, res) => {
  res.render("manager-home", {
    PORTAL_API: process.env.PORTAL_API || PORTAL_API,
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || KOMEKCI_SISTEMI_API,
  });
});

app.get("/technician-home", isTechnician, (req, res) => {
  res.render("technician-home", {
    PORTAL_API: process.env.PORTAL_API || PORTAL_API,
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || KOMEKCI_SISTEMI_API,
  });
});

app.get("/admin-home", isAdmin, (req, res) => {
  res.render("admin-home", {
    PORTAL_API: process.env.PORTAL_API || PORTAL_API,
    KOMEKCI_SISTEMI_API: process.env.KOMEKCI_SISTEMI_API || KOMEKCI_SISTEMI_API,
  });
});

// Error Handling
app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
