import pool from "../db/dbConnection.js";

// Get a single ticket by ID (only if it belongs to the logged-in user)
export const getTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    let userId;

    if (req.user) {
      userId = req.user.id; // Passport session vasitəsilə user ID
    } else if (req.session && req.session.user) {
      userId = req.session.user.id; // Sessiya vasitəsilə user ID
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Ticket-i DB-dən götür və yalnız bu user-ə aid olanı seç
    const [rows] = await pool.query(
      `SELECT t.*, u.username AS assigned_to_username
       FROM tickets t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND t.created_by = ?`,
      [ticketId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only access your own tickets" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Update own ticket (status cannot be changed by user)
export const updateTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;      // route param /tickets/:id
    let userId;

    if (req.user) {
      userId = req.user.id; // Passport session vasitəsilə user ID
    } else if (req.session && req.session.user) {
      userId = req.session.user.id; // Sessiya vasitəsilə user ID
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const { short_description, description, organization, type } = req.body;

    // 1️⃣ Ticket istifadəçiyə məxsusdursa yoxla
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? AND created_by = ?",
      [ticketId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only update your own tickets" });
    }

    // 2️⃣ Ticket-i yenilə (status dəyişmir)
    await pool.query(
      `UPDATE tickets
       SET short_description = ?, description = ?, organization = ?, type = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        short_description || rows[0].short_description,
        description || rows[0].description,
        organization || rows[0].organization,
        type || rows[0].type,
        ticketId
      ]
    );

    res.status(200).json({ message: "Ticket updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Delete ticket (only own tickets)
export const deleteTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;      // route param, məsələn: /tickets/:id
    let userId;

    if (req.user) {
      userId = req.user.id; // Passport session vasitəsilə user ID
    } else if (req.session && req.session.user) {
      userId = req.session.user.id; // Sessiya vasitəsilə user ID
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 1️⃣ Yoxla: ticket istifadəçiyə məxsusdursa
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? AND created_by = ?",
      [ticketId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only delete your own tickets" });
    }

    // 2️⃣ Ticket-i sil
    await pool.query("DELETE FROM tickets WHERE id = ?", [ticketId]);

    // 3️⃣ users.tickets array-dan ID-ni sil
    await pool.query(
      "UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', ?))) WHERE id = ?",
      [ticketId, userId]
    );

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get my tickets
export const getTickets = async (req, res, next) => {
  try {
    let userId;

    if (req.user) {
      userId = req.user.id; // Passport session vasitəsilə user ID
    } else if (req.session && req.session.user) {
      userId = req.session.user.id; // Sessiya vasitəsilə user ID
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const [tickets] = await pool.query(
      `SELECT 
         t.id,
         t.type,
         t.organization,
         t.phone_number,
         t.short_description,
         t.description,
         t.status,
         t.assigned_to,
         a.username AS assigned_to_username
       FROM tickets t
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.created_by = ?
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// 🔹 Create Ticket Controller
export const createTicket = async (req, res, next) => {
  try {
    const { type, organization, phone_number, short_description, description } = req.body;
    let userId;

    if (req.user) {
      userId = req.user.id; // Passport session vasitəsilə user ID
    } else if (req.session && req.session.user) {
      userId = req.session.user.id; // Sessiya vasitəsilə user ID
    } else {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 1️⃣ Ticket-i yaradın
    const [ticketResult] = await pool.query(
      `INSERT INTO tickets (type, organization, phone_number, short_description, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, organization, phone_number, short_description, description, userId]
    );

    const ticketId = ticketResult.insertId;

    // 2️⃣ Ticket ID-ni users.tickets JSON array-ına əlavə et
    await pool.query(
      `UPDATE users 
       SET tickets = JSON_ARRAY_APPEND(tickets, '$', ?) 
       WHERE id = ?`,
      [ticketId, userId]
    );

    res.status(201).json({
      message: "Ticket created successfully",
      ticketId
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

