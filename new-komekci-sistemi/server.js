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
import { isAuthenticated } from "./src/middleware/authMiddleware.js";
import { isManager } from "./src/middleware/managerMiddleware.js";
import { isTechnician } from "./src/middleware/technicianMiddleware.js";

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

// API ENDPOINTS
app.use("/api/auth/", authRoutes)
app.use("/api/users/", userRoutes)
app.use("/api/managers/", managerRoutes)
app.use("/api/technicians/", technicianRoutes)

// Login and Register (public)
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/user-home", isAuthenticated, (req, res) => {
  res.render("user-home");
});

app.get("/manager-home", isManager, (req, res) => {
  res.render("manager-home");
});

// Error Handling
app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
