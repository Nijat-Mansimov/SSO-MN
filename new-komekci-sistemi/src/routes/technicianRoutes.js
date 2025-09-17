import express from 'express';
import { getTickets, updateTicketStatus, getResolvedTickets, getAllResolvedTickets, addResolvedComment  } from '../controllers/technicianControllers.js';
import { isTechnician } from "../middleware/technicianMiddleware.js";

const router = express.Router();

router.get("/tickets", isTechnician, getTickets)
router.put("/ticket/:id/status", isTechnician, updateTicketStatus)
router.get("/tickets/resolved", isTechnician, getResolvedTickets )
router.get("/tickets/all/resolved", isTechnician, getAllResolvedTickets )
router.post("/tickets/:id/resolved-comment", isTechnician, addResolvedComment  )

export { router }; // named export