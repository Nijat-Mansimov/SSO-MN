import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";
import axios from "axios";


// ======================= USERS =======================

// Get all users (admin)
export const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, isAdmin, created_at FROM users"
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create user (admin)
export const createUser = async (req, res) => {
  const { username, password, email, isAdmin } = req.body;
  if (!username || !password || !email) 
    return res.status(400).json({ error: "Missing fields" });

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.status(400).json({ error: "Username exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, email, isAdmin) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, email, isAdmin || 0]
    );

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update user (admin)
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

    values.push(userId); // For WHERE clause
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete user (admin)
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

// ======================= SERVICES =======================

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const [services] = await pool.query(
      "SELECT id, service_name, name, url, description, created_at FROM services"
    );
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Create a new service
export const createService = async (req, res) => {
  const { service_name, name, url, description } = req.body;
  
  if (!service_name || !name || !url) {
    return res.status(400).json({ error: "Service name, name, and URL required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM services WHERE service_name = ?",
      [service_name]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Service already exists" });
    }

    await pool.query(
      "INSERT INTO services (service_name, name, url, description) VALUES (?, ?, ?, ?)",
      [service_name, name, url, description || null]
    );

    res.json({ message: "Service created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Update a service
export const updateService = async (req, res) => {
  const serviceId = req.params.id;
  const { service_name, name, url, description } = req.body;

  if (!service_name && !name && !url && !description) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  try {
    const fields = [];
    const values = [];

    if (service_name) {
      fields.push("service_name = ?");
      values.push(service_name);
    }
    
    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    
    if (url) {
      fields.push("url = ?");
      values.push(url);
    }

    if (description) {
      fields.push("description = ?");
      values.push(description);
    }

    values.push(serviceId); // For WHERE clause
    const sql = `UPDATE services SET ${fields.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  const serviceId = req.params.id;
  try {
    await pool.query("DELETE FROM services WHERE id = ?", [serviceId]);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ======================= USER_SERVICES =======================
// Xidmətə görə SSO API mapping
const SERVICE_SSO_API = {
  komekci_sistemi: "http://localhost:4000/api/sso/create/user",
  salam: "http://localhost:5000/api/sso/create/user"
};

export const assignServiceToUser = async (req, res) => {
  const { userId, serviceIds } = req.body; // serviceIds array olacaq
  if (!userId || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ error: "userId və ən azı bir serviceId tələb olunur" });
  }

  try {
    // 1️⃣ Seçilmiş istifadəçinin məlumatını götür
    const [userRows] = await pool.query(
      "SELECT username, password FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "İstifadəçi tapılmadı" });
    }

    const { username, password } = userRows[0];

    // 2️⃣ Hər bir xidmət üçün SSO istifadəçini yarat
    for (let serviceId of serviceIds) {
      // Xidmətin adını əldə et
      const [serviceRow] = await pool.query(
        "SELECT service_name FROM services WHERE id = ?",
        [serviceId]
      );
      if (!serviceRow.length) continue; // Xidmət tapılmadısa skip et

      const serviceName = serviceRow[0].service_name;
      const SSO_CREATE_USER_API = SERVICE_SSO_API[serviceName];

      if (!SSO_CREATE_USER_API) {
        console.warn(`SSO API tapılmadı: ${serviceName}`);
        continue; // mapping yoxdursa skip et
      }

      try {
        await axios.post(SSO_CREATE_USER_API, {
          username,
          password,
          role: "user"
        });
      } catch (err) {
        console.warn(`SSO user creation warning for ${serviceName}:`, err.response?.data || err.message);
      }
    }

    // 3️⃣ Mövcud təyinatları yoxla
    const [existing] = await pool.query(
      "SELECT service_id FROM user_services WHERE user_id = ?",
      [userId]
    );
    const existingIds = existing.map(row => row.service_id);

    // 4️⃣ Yalnız yeni xidmətləri əlavə etmək üçün filtrlə
    const newServiceIds = serviceIds.filter(serviceId => !existingIds.includes(serviceId));
    if (newServiceIds.length === 0) {
      return res.status(400).json({ error: "Bütün seçilmiş xidmətlər artıq təyin olunub" });
    }

    // 5️⃣ Bulk insert üçün dəyərləri hazırla
    const valuesToInsert = newServiceIds.map(serviceId => [userId, serviceId]);
    const [result] = await pool.query(
      "INSERT INTO user_services (user_id, service_id) VALUES ?",
      [valuesToInsert]
    );

    res.json({
      message: `${result.affectedRows} xidmət uğurla təyin olundu.`,
      added: result.affectedRows
    });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
};


// Remove service from a user
export const removeServiceFromUser = async (req, res) => {
  const { userId, serviceId } = req.body;
  if (!userId || !serviceId) return res.status(400).json({ error: "userId and serviceId required" });

  try {
    await pool.query(
      "DELETE FROM user_services WHERE user_id = ? AND service_id = ?",
      [userId, serviceId]
    );

    res.json({ message: "Service removed from user successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};


// Bütün istifadəçi-xidmət əlaqələrini gətir
export const getUserServices = async (req, res) => {
  try {
    const [userServices] = await pool.query(
      `SELECT
         us.user_id,
         u.username,
         us.service_id,
         s.service_name
       FROM
         user_services us
       JOIN
         users u ON us.user_id = u.id
       JOIN
         services s ON us.service_id = s.id
       ORDER BY
         us.user_id, us.service_id`
    );
    res.json(userServices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};