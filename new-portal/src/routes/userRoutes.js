import express from 'express';
import { getMe, getMyServices } from '../controllers/userControllers.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', getMe);
router.get("/my-services", isAuthenticated, getMyServices);

export { router };