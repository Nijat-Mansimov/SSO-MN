import express from 'express';
import { getTickets, deleteTicket, assignTicket, getTechnicians, getAllResolvedTickets } from '../controllers/managerControllers.js';
import { isManager } from "../middleware/managerMiddleware.js";

const router = express.Router();

router.get('/tickets', isManager, getTickets);
router.delete("/ticket/:id", isManager, deleteTicket)
router.put("/ticket/:id/assign", isManager, assignTicket)
router.get("/technicians", isManager, getTechnicians)
router.get("/tickets/resolved", isManager, getAllResolvedTickets)


export { router }; // named export
