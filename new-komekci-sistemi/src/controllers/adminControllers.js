import pool from "../db/dbConnection.js";
import xlsx from 'xlsx'; // npm install xlsx

/**
 * @route GET /api/admins/statistics
 * @desc Get all dashboard statistics
 * @access Private (Admin)
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const [totalTickets] = await pool.query("SELECT COUNT(*) as count FROM tickets");
        const [resolvedTickets] = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'completed'");
        const [totalUsers] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        const [totalTechnicians] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'technician'");

        const [statusStats] = await pool.query("SELECT status, COUNT(*) as count FROM tickets GROUP BY status");
        const [typeStats] = await pool.query("SELECT type, COUNT(*) as count FROM tickets GROUP BY type");
        const [userStats] = await pool.query(
            "SELECT u.username, COUNT(t.id) as tickets_created FROM users u LEFT JOIN tickets t ON u.id = t.created_by GROUP BY u.id ORDER BY tickets_created DESC"
        );
        const [technicianStats] = await pool.query(
            "SELECT u.username, COUNT(t.id) as tickets_assigned FROM users u LEFT JOIN tickets t ON u.id = t.assigned_to WHERE u.role = 'technician' GROUP BY u.id ORDER BY tickets_assigned DESC"
        );
        const [recentResolved] = await pool.query(`
            SELECT 
                rt.ticket_id,
                rt.comment,
                rt.resolved_at,
                t.short_description,
                t.status,
                u1.username AS created_by_username,
                u2.username AS assigned_to_username
            FROM resolved_tickets rt
            JOIN tickets t ON rt.ticket_id = t.id
            JOIN users u1 ON t.created_by = u1.id
            LEFT JOIN users u2 ON t.assigned_to = u2.id
            ORDER BY rt.resolved_at DESC
            LIMIT 10
        `);

        res.status(200).json({
            totalTickets: totalTickets[0].count,
            resolvedTickets: resolvedTickets[0].count,
            totalUsers: totalUsers[0].count,
            totalTechnicians: totalTechnicians[0].count,
            statusStats,
            typeStats,
            userStats,
            technicianStats,
            recentResolved
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admins/export/statistics
 * @desc Export all statistics to an Excel file
 * @access Private (Admin)
 */
export const exportStatistics = async (req, res, next) => {
    try {
        // 1. Fetch all data
        const [statusStats] = await pool.query("SELECT status, COUNT(*) as count FROM tickets GROUP BY status");
        const [typeStats] = await pool.query("SELECT type, COUNT(*) as count FROM tickets GROUP BY type");
        const [userStats] = await pool.query(
            "SELECT u.username, COUNT(t.id) as tickets_created FROM users u LEFT JOIN tickets t ON u.id = t.created_by GROUP BY u.id ORDER BY tickets_created DESC"
        );
        const [technicianStats] = await pool.query(
            "SELECT u.username, COUNT(t.id) as tickets_assigned FROM users u LEFT JOIN tickets t ON u.id = t.assigned_to WHERE u.role = 'technician' GROUP BY u.id ORDER BY tickets_assigned DESC"
        );
        const [recentResolved] = await pool.query(`
            SELECT 
                rt.ticket_id,
                t.short_description,
                u1.username AS created_by_username,
                u2.username AS assigned_to_username,
                rt.resolved_at
            FROM resolved_tickets rt
            JOIN tickets t ON rt.ticket_id = t.id
            JOIN users u1 ON t.created_by = u1.id
            LEFT JOIN users u2 ON t.assigned_to = u2.id
            ORDER BY rt.resolved_at DESC
            LIMIT 100
        `);

        // 2. Create workbook and worksheets
        const wb = xlsx.utils.book_new();

        // Status Stats
        const statusWs = xlsx.utils.json_to_sheet(statusStats);
        xlsx.utils.book_append_sheet(wb, statusWs, "Status Statistikası");

        // Type Stats
        const typeWs = xlsx.utils.json_to_sheet(typeStats);
        xlsx.utils.book_append_sheet(wb, typeWs, "Tip Statistikası");
        
        // User Stats
        const userWs = xlsx.utils.json_to_sheet(userStats);
        xlsx.utils.book_append_sheet(wb, userWs, "İstifadəçi Statistikası");

        // Technician Stats
        const techWs = xlsx.utils.json_to_sheet(technicianStats);
        xlsx.utils.book_append_sheet(wb, techWs, "Texnik Statistikası");

        // Recent Resolved Tickets
        const resolvedWs = xlsx.utils.json_to_sheet(recentResolved);
        xlsx.utils.book_append_sheet(wb, resolvedWs, "Son Həll Olunanlar");

        // 3. Write and send file
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=statistikalar.xlsx');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admins/tickets
 * @desc Get all tickets or a single ticket by ID
 * @access Private (Admin)
 */
export const getAllTickets = async (req, res, next) => {
    try {
        const { id } = req.query;
        if (id) {
            const [tickets] = await pool.query(`
                SELECT
                    t.id,
                    t.type,
                    t.organization,
                    t.phone_number,
                    t.short_description,
                    t.description,
                    t.status,
                    t.created_at,
                    u1.username AS created_by_username,
                    u2.username AS assigned_to_username
                FROM tickets t
                JOIN users u1 ON t.created_by = u1.id
                LEFT JOIN users u2 ON t.assigned_to = u2.id
                WHERE t.id = ?
            `, [id]);
            return res.status(200).json({ tickets });
        }
        
        const [tickets] = await pool.query(`
            SELECT
                t.id,
                t.short_description,
                t.status,
                u1.username AS created_by_username,
                u2.username AS assigned_to_username
            FROM tickets t
            JOIN users u1 ON t.created_by = u1.id
            LEFT JOIN users u2 ON t.assigned_to = u2.id
            ORDER BY t.created_at DESC
        `);
        res.status(200).json({ tickets });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admins/users
 * @desc Get all users
 * @access Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const [users] = await pool.query("SELECT id, username, email, role, status FROM users");
        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
};

/**
 * @route GET /api/admins/technicians
 * @desc Get all technicians and their resolved ticket count
 * @access Private (Admin)
 */
export const getAllTechnicians = async (req, res, next) => {
    try {
        const [technicians] = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.status,
                (SELECT COUNT(*) FROM resolved_tickets rt JOIN tickets t ON rt.ticket_id = t.id WHERE t.assigned_to = u.id) AS resolved_count
            FROM users u
            WHERE u.role = 'technician'
        `);
        res.status(200).json({ technicians });
    } catch (error) {
        next(error);
    }
};