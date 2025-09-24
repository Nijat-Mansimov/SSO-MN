import express from 'express';
import { login, logout, register, ldapLogin } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/login', login);
// router.post('/register', register);
router.post("/logout", logout)
router.post("/register", register)
// LDAP login
router.post("/ldap-login", ldapLogin);

export { router };
