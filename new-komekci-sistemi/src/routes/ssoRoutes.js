import express from 'express';
import { handleSSOLogin, verifyTokenDirectly, createUser } from '../controllers/ssoController.js';

const router = express.Router();

// SSO login endpointi
router.get('/sso-login', handleSSOLogin);

// Token yoxlama endpointi (ehtiyat üçün)
router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    const result = verifyTokenDirectly(token);
    res.json(result);
});

router.post('/create/user', createUser)

export { router as ssoRoutes };