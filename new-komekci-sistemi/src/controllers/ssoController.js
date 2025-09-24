import jwt from 'jsonwebtoken';
import axios from 'axios';
import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";

const JWT_SECRET = 'portal_komekci_shared_secret_key_2025';
const PORTAL_VERIFY_API = 'http://172.22.61.7:3000/api/sso/verify-token';

// SSO token yoxlama və login
export const handleSSOLogin = async (req, res) => {
    try {
        const { sso_token } = req.query;
        
        if (!sso_token) {
            return res.status(400).render('login', { 
                error: 'SSO token təqdim edilməyib' 
            });
        }

        // Tokenı PORTAL-da yoxlat
        const verificationResponse = await axios.post(PORTAL_VERIFY_API, {
            token: sso_token
        });

        if (verificationResponse.data.valid) {
            const userData = verificationResponse.data.user;
            // SSO-dan gələn istifadəçi adını (username) verilənlər bazasında axtar
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [userData.username]);
            const userFromDB = rows[0];

            if (!userFromDB) {
                // Əgər istifadəçi verilənlər bazasında yoxdursa,
                // burada yeni istifadəçi yarada bilərsiniz.
                // Hal-hazırda sadəcə xəta qaytarılır.
                return res.status(404).render('login', {
                    error: 'Verilənlər bazasında bu istifadəçi tapılmadı.'
                });
            }
            console.log(userFromDB)
            // Verilənlər bazasından gələn istifadəçi məlumatlarını sessionda saxla
            req.session.user = {
                id: userFromDB.id,
                username: userFromDB.username,
                email: userFromDB.email,
                // isAdmin: userFromDB.isAdmin || false,
                role: userFromDB.role,
                ssoLogin: true // SSO ilə giriş etdiyini qeyd et
            };

            // Roluna uyğun səhifəyə yönləndir
            return redirectBasedOnRole(req, res);
        } else {
            return res.status(401).render('login', { 
                error: 'SSO token etibarsızdır və ya vaxtı bitib' 
            });
        }
    } catch (error) {
        console.error('SSO login xətası:', error);
        return res.status(500).render('login', { 
            error: 'SSO girişi zamanı xəta baş verdi' 
        });
    }
};

// Roluna görə yönləndirmə
const redirectBasedOnRole = (req, res) => {
    const user = req.session.user;
    
    switch (user.role) {
        case 'admin':
            return res.redirect('/admin-home');
        case 'manager':
            return res.redirect('/manager-home');
        case 'technician':
            return res.redirect('/technician-home');
        default:
            return res.redirect('/user-home');
    }
};

// SSO token yoxlama (alternativ - birbaşa JWT yoxlama)
export const verifyTokenDirectly = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, user: decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};


// SSO redirect zamani user'i yarat
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1️⃣ Email yoxlama
    const [emailRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Username yoxlama
    const [usernameRows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (usernameRows.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // 3️⃣ Parolu hash etmək
    // const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Yeni istifadəçi yaratmaq
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, tickets) VALUES (?, ?, ?, ?, JSON_ARRAY())",
      [username, email, password, role || "user"]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.insertId,
        username,
        email,
        role: role || "user"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};