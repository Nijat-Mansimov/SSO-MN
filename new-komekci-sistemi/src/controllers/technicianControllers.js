import pool from "../db/dbConnection.js";

// 🔹 Add comment to already resolved ticket (technician)
export const addResolvedComment = async (req, res, next) => {
  try {
    const technicianId = req.user.id;
    const ticketId = req.params.id;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const [resolvedRows] = await pool.query(
      "SELECT * FROM resolved_tickets WHERE ticket_id = ?",
      [ticketId]
    );

    if (resolvedRows.length > 0) {
      // Şərh mövcud olduğu halda yenilə
      await pool.query(
        "UPDATE resolved_tickets SET comment = ? WHERE ticket_id = ?",
        [comment, ticketId]
      );
      res.status(200).json({ message: "Comment updated successfully" });
    } else {
      return res.status(404).json({ message: "Resolved ticket not found. First, complete the ticket." });
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get all resolved tickets (Manager)
export const getAllResolvedTickets = async (req, res, next) => {
  try {
    const [resolvedTickets] = await pool.query(`
      SELECT 
          rt.id AS resolved_id,
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
      ORDER BY rt.resolved_at DESC
    `);

    res.status(200).json({ resolvedTickets });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get resolved tickets for the logged-in technician
export const getResolvedTickets = async (req, res, next) => {
  try {
    const technicianId = req.user.id;

    const [resolvedTickets] = await pool.query(
      `SELECT 
          rt.id AS resolved_id,
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
    const ticketId = req.params.id;
    const technicianId = req.user.id;
    const { status, comment } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? AND assigned_to = ?",
      [ticketId, technicianId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "You can only update tickets assigned to you" });
    }

    if (status === "completed") {
      if (!comment) {
        return res.status(400).json({ message: "Comment is required to complete a ticket" });
      }

      const [resolvedRows] = await pool.query(
        "SELECT * FROM resolved_tickets WHERE ticket_id = ?",
        [ticketId]
      );
      if (resolvedRows.length > 0) {
        return res.status(403).json({ message: "Cannot update status: Ticket is already completed" });
      }

      // Əvvəlcə resolved_tickets-ə əlavə et
      await pool.query(
        "INSERT INTO resolved_tickets (ticket_id, comment) VALUES (?, ?)",
        [ticketId, comment]
      );
    }

    // Sonra ticket statusunu yenilə
    await pool.query(
      "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, ticketId]
    );

    res.status(200).json({ message: "Ticket status updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 🔹 Get tickets assigned to the logged-in technician
export const getTickets = async (req, res, next) => {
  try {
    const technicianId = req.user.id;

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