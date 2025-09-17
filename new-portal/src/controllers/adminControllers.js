import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";

// Get all users (for admin)
export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, username, email, isAdmin FROM users");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create user (admin-only)
export const createUser = async (req, res) => {
  const { username, password, email, isAdmin } = req.body;
  if (!username || !password || !email) return res.status(400).json({ error: "Missing fields" });

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "Username exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, email, isAdmin) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, email, isAdmin || false]
    );
    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete user (admin-only)
export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};


// Update a user (admin-only)
export const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { username, email, password, isAdmin } = req.body;

  if (!username && !email && !password && isAdmin === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  try {
    const fields = [];
    const values = [];

    if (username) {
      fields.push("username = ?");
      values.push(username);
    }

    if (email) {
      fields.push("email = ?");
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    if (isAdmin !== undefined) {
      fields.push("isAdmin = ?");
      values.push(isAdmin);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(userId); // For WHERE clause

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
