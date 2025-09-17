// src/controllers/userControllers.js
import pool from "../db/dbConnection.js"; // ES module import

// Controller to get the currently logged-in user
export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Return only safe fields, never the password
  const { id, username, email, isAdmin } = req.user;

  res.json({ id, username, email, isAdmin });
};

