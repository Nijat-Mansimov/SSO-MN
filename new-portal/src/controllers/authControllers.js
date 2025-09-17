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
      res.json({ message: "Logged in successfully", user: { username: user.username, email: user.email, isAdmin: user.isAdmin } });
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

// LDAP Login
export const ldapLogin = (req, res, next) => {
  passport.authenticate("ldapauth", (err, user, info) => {
    if (err) return next(err);
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
