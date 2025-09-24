import jwt from 'jsonwebtoken';

// Gizli açar (real tətbiqdə environment dəyişənində saxlayın)
const JWT_SECRET = 'app1_app2_shared_secret_key_2024';
const KOMEKCI_SISTEMI_API = 'http://172.22.61.7:4000/api';

// SSO token yaratma
export const generateSSOTokenForKomekciSistemi = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'İstifadəçi autentifikasiya olunmayıb' });
        }

        const userData = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            isAdmin: req.user.isAdmin || false,
            role: "user",
            exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 dəqiqəlik token
        };

        const token = jwt.sign(userData, JWT_SECRET);
        
        // App2-yə SSO token ilə yönləndir
        res.redirect(`${KOMEKCI_SISTEMI_API}/sso/sso-login?sso_token=${token}`);
    } catch (error) {
        console.error('SSO token yaratma xətası:', error);
        res.status(500).json({ error: 'SSO token yaradılarkən xəta baş verdi' });
    }
};

// Token yoxlama endpointi (App2 üçün)
export const verifySSOToken = (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token təqdim edilməyib' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ 
            valid: true, 
            user: decoded 
        });
  
    } catch (error) {
        res.json({ 
            valid: false, 
            error: error.message 
        });
     
    }
};