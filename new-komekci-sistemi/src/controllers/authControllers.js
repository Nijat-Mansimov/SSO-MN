// src/controllers/userControllers.js
import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";
import passport from "../config/passport.js";

// Login user
export const login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Logged in successfully", user: { username: user.username, email: user.email, role: user.role } });
    });
  })(req, res, next);
};

// Logout user
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Logout failed" });
    }
    // Destroy session completely
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.json({ message: "Logged out successfully" });
    });
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1️⃣ Email yoxlama
    const [emailRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Username yoxlama
    const [usernameRows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (usernameRows.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // 3️⃣ Parolu hash etmək
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Yeni istifadəçi yaratmaq
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, tickets) VALUES (?, ?, ?, ?, JSON_ARRAY())",
      [username, email, hashedPassword, role || "user"]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.insertId,
        username,
        email,
        role: role || "user"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LDAP Login
export const ldapLogin = (req, res, next) => {
  console.log("DEBUG 1")
  passport.authenticate("ldapauth", (err, user, info) => {
    if (err) return next(err);
    console.log("DEBUG 2")
    if (!user) return res.status(400).json({ error: info?.message || "Invalid LDAP login" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({
        message: "LDAP login successful",
        user,
      });
    });
  })(req, res, next);
};