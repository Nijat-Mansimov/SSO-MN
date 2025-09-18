import express from 'express';
import { isAdmin } from '../middleware/adminMiddleware.js';
import {
    getDashboardStats,
    exportStatistics,
    getAllTickets,
    getAllUsers,
    getAllTechnicians
} from '../controllers/adminControllers.js';

const router = express.Router();

// Dashboard statistikalarını gətir
router.get('/statistics', isAdmin, getDashboardStats);

// Statistikaları Excel formatında ixrac et
router.get('/export/statistics', isAdmin, exportStatistics);

// Bütün ticketləri gətir (və ya ID-yə görə birini)
router.get('/tickets', isAdmin, getAllTickets);

// Bütün istifadəçiləri gətir
router.get('/users', isAdmin, getAllUsers);

// Bütün texnikləri gətir
router.get('/technicians', isAdmin, getAllTechnicians);

export { router }; // named export