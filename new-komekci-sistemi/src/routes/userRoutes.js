import express from 'express';
import { createTicket, getTickets, getTicket, deleteTicket, updateTicket } from '../controllers/userControllers.js';
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/create', isAuthenticated, createTicket);
router.get("/tickets/:id", isAuthenticated, getTicket)
router.get("/tickets", isAuthenticated, getTickets)
router.delete("/ticket/:id", isAuthenticated, deleteTicket)
router.put("/ticket/:id", isAuthenticated, updateTicket)

export { router }; // named export
