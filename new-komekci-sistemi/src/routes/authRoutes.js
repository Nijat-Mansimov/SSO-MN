import express from 'express';
import { login, logout, register } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/login', login);
// router.post('/register', register);
router.post("/logout", logout)
router.post("/register", register)

export { router };
