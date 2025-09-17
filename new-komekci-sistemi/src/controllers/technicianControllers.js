// src/controllers/technicianControllers.js
import pool from "../db/dbConnection.js";

// 🔹 Add comment to already resolved ticket (technician)
export const addResolvedComment = async (req, res, next) => {
  try {
    const technicianId = req.user.id; // logged-in technician
    const ticketId = req.params.id;   // /tickets/:id/resolved-comment
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // 1️⃣ Ticket-in technician-ə təyin olunub-olunmadığını və status-un completed olduğunu yoxla
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? AND assigned_to = ? AND status = 'completed'",
      [ticketId, technicianId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only comment on your completed tickets" });
    }

    // 2️⃣ Resolved comment əlavə et
    await pool.query(
      "INSERT INTO resolved_tickets (ticket_id, comment) VALUES (?, ?)",
      [ticketId, comment]
    );

    res.status(200).json({ message: "Comment added to resolved ticket successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

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

// 🔹 Get resolved tickets for the logged-in technician
export const getResolvedTickets = async (req, res, next) => {
  try {
    const technicianId = req.user.id; // Passport session vasitəsilə technician ID

    const [resolvedTickets] = await pool.query(
      `SELECT rt.id AS resolved_id,
              rt.ticket_id,
              rt.comment,
              rt.resolved_at,
              t.short_description,
              t.description,
              t.status,
              u.username AS created_by_username
       FROM resolved_tickets rt
       JOIN tickets t ON rt.ticket_id = t.id
       JOIN users u ON t.created_by = u.id
       WHERE t.assigned_to = ? AND t.status = 'completed'
       ORDER BY rt.resolved_at DESC`,
      [technicianId]
    );

    res.status(200).json({ resolvedTickets });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Technician updates status of assigned ticket
export const updateTicketStatus = async (req, res, next) => {
  try {
    const ticketId = req.params.id;        // route param /tickets/:id/status
    const technicianId = req.user.id;      // Passport session vasitəsilə technician ID
    const { status } = req.body;

    // 1️⃣ Ticket-in technician-ə təyin olunub-olunmadığını yoxla
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? AND assigned_to = ?",
      [ticketId, technicianId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only update tickets assigned to you" });
    }

    // 2️⃣ Əgər ticket artıq resolved_tickets-də varsa, update qadağandır
    const [resolvedRows] = await pool.query(
      "SELECT * FROM resolved_tickets WHERE ticket_id = ?",
      [ticketId]
    );

    if (resolvedRows.length > 0) {
      return res.status(403).json({ message: "Cannot update ticket status: already resolved" });
    }

    // 3️⃣ Ticket-i yenilə (status update)
    await pool.query(
      `UPDATE tickets
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, ticketId]
    );

    // 4️⃣ Əgər status completed-dirsə, resolved_tickets-ə əlavə et
    if (status === "completed") {
      await pool.query(
        "INSERT INTO resolved_tickets (ticket_id, comment) VALUES (?, '')",
        [ticketId]
      );
    }

    res.status(200).json({ message: "Ticket status updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



// 🔹 Get tickets assigned to the logged-in technician
export const getTickets = async (req, res, next) => {
  try {
    const technicianId = req.user.id; // Passport session vasitəsilə istifadəçi ID

    const [tickets] = await pool.query(
      `SELECT 
         t.id,
         t.type,
         t.organization,
         t.phone_number,
         t.short_description,
         t.description,
         t.status,
         t.created_by,
         u.username AS created_by_username
       FROM tickets t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [technicianId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error);
    next(error);
  }
};