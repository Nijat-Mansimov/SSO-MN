import express from 'express';
import { login, logout, ldapLogin } from '../controllers/authControllers.js';

const router = express.Router();

router.post('/login', login);
// router.post('/register', register);
router.post("/logout", logout)

// LDAP login
router.post("/ldap-login", ldapLogin);

export { router }; // named export
