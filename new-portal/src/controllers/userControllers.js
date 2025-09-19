// src/controllers/userControllers.js
import pool from "../db/dbConnection.js"; // ES module import

// Get services assigned to the currently logged-in user
export const getMyServices = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  try {
    const userId = req.user.id;

    const [services] = await pool.query(
      `SELECT s.id, s.service_name, s.name, s.url, s.description
       FROM services s
       JOIN user_services us ON s.id = us.service_id
       WHERE us.user_id = ?`,
      [userId]
    );

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Controller to get the currently logged-in user
export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Return only safe fields, never the password
  const { id, username, email, isAdmin } = req.user;

  res.json({ id, username, email, isAdmin });
};

