import express from 'express';
import { generateSSOTokenForKomekciSistemi, verifySSOToken } from '../controllers/ssoController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// App2-yə SSO ilə yönləndirmə
router.get('/sso-redirect/komekci_sistemi', isAuthenticated, generateSSOTokenForKomekciSistemi);

// Token yoxlama endpointi (App2 tərəfindən istifadə üçün)
router.post('/verify-token', verifySSOToken);

export { router as ssoRoutes };