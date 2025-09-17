// src/controllers/managerControllers.js
import pool from "../db/dbConnection.js";


// 🔹 Get all resolved tickets (Manager)
export const getAllResolvedTickets = async (req, res, next) => {
  try {
    const [resolvedTickets] = await pool.query(
      `SELECT rt.id AS resolved_id,
              rt.ticket_id,
              rt.comment,
              rt.resolved_at,
              t.short_description,
              t.description,
              t.status,
              u.username AS created_by_username,
              a.username AS assigned_to_username
       FROM resolved_tickets rt
       JOIN tickets t ON rt.ticket_id = t.id
       JOIN users u ON t.created_by = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ORDER BY rt.resolved_at DESC`
    );

    res.status(200).json({ resolvedTickets });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get a single ticket by ID (Manager can see all tickets)
export const getTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
         t.id,
         t.type,
         t.organization,
         t.phone_number,
         t.short_description,
         t.description,
         t.status,
         t.created_by,
         t.assigned_to,
         u.username AS created_by_username,
         a.username AS assigned_to_username
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = ?`,
      [ticketId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ ticket: rows[0] });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get a single resolved ticket by ticket_id
export const getResolvedTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
         rt.id AS resolved_id,
         rt.ticket_id,
         rt.comment,
         rt.resolved_at,
         t.type,
         t.organization,
         t.phone_number,
         t.short_description,
         t.description,
         t.status,
         t.created_by,
         t.assigned_to,
         u.username AS created_by_username,
         a.username AS assigned_to_username
       FROM resolved_tickets rt
       JOIN tickets t ON rt.ticket_id = t.id
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE rt.ticket_id = ?`,
      [ticketId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Resolved ticket not found" });
    }

    res.status(200).json({ resolvedTicket: rows[0] });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get all technicians (Manager)
export const getTechnicians = async (req, res, next) => {
  try {
    const [technicians] = await pool.query(
      "SELECT id, username, email FROM users WHERE role = 'technician'"
    );

    res.status(200).json({ technicians });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Assign ticket to technician (Manager)
export const assignTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id;        // route param: /tickets/:id/assign
    const { technicianId } = req.body;     // body-də göndərilən technician ID

    // 1️⃣ Ticket-in mövcudluğunu yoxla
    const [ticketRows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [ticketId]
    );

    if (ticketRows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 2️⃣ Technician-in mövcudluğunu yoxla və rolunun technician olduğunu təsdiqlə
    const [techRows] = await pool.query(
      "SELECT * FROM users WHERE id = ? AND role = 'technician'",
      [technicianId]
    );

    if (techRows.length === 0) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // 3️⃣ Ticket-i təyin et
    await pool.query(
      "UPDATE tickets SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [technicianId, ticketId]
    );

    res.status(200).json({ message: "Ticket successfully assigned", ticketId, assigned_to: technicianId });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Delete ticket (Manager)
export const deleteTicket = async (req, res, next) => {
  try {
    const ticketId = req.params.id; // /tickets/:id

    // 1️⃣ Ticket-in mövcudluğunu yoxla
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [ticketId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // 2️⃣ Ticket-i sil
    await pool.query("DELETE FROM tickets WHERE id = ?", [ticketId]);

    // 3️⃣ users.tickets array-dan ID-ni sil
    await pool.query(
      "UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', ?))) WHERE JSON_CONTAINS(tickets, JSON_ARRAY(?))",
      [ticketId, ticketId]
    );

    res.status(200).json({ message: "Ticket deleted successfully by manager" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get all tickets (Manager)
export const getTickets = async (req, res, next) => {
  try {
    const [tickets] = await pool.query(`
      SELECT 
        t.id,
        t.type,
        t.organization,
        t.phone_number,
        t.short_description,
        t.description,
        t.status,
        t.created_by,
        t.assigned_to,
        u.username AS created_by_username,
        a.username AS assigned_to_username
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      tickets
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
