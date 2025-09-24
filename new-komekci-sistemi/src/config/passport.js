import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as LdapStrategy } from "passport-ldapauth";
import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";

// ------------------
// Local Strategy (MySQL + bcrypt)
// ------------------
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (rows.length === 0)
        return done(null, false, { message: "User not found" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// ------------------
// LDAP Strategy
// ------------------
const LDAP_OPTIONS = {
  server: {
    url: "ldaps://172.22.60.1:636",
    bindDN: "CN=office ldap,CN=Users,DC=mnbq,DC=local",
    bindCredentials: "KqTfXk3rvbLj6PXmIgY9",
    searchBase: "ou=545,ou=Departments-USERS,dc=mnbq,dc=local",
    searchFilter: "(sAMAccountName={{username}})",
    searchAttributes: ["cn", "mail", "sAMAccountName"],
    tlsOptions: {
      rejectUnauthorized: false,   // sertifikat yoxlanmır
    },
  },
  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true // bu əlavə edildi
};

passport.use(
  "ldapauth",
  new LdapStrategy(LDAP_OPTIONS, async (req, ldapUser, done) => {
    try {
      console.log(ldapUser);

      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [ldapUser.sAMAccountName]
      );

      let user;

      if (rows.length > 0) {
        // DB-də mövcud user
        user = rows[0];
      } else {
        // Yeni user yaradılır → req.body.password istifadə olunur
        const passwordPlain = req.body.password; // 👈 burada frontend-dən gələn password
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);
        const email = ldapUser.mail || null;
        const [result] = await pool.query(
          "INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)",
          [
            ldapUser.sAMAccountName,
            email,
            hashedPassword,
            false, // default admin = false
          ] 
        );

        user = {
          id: result.insertId,
          username: ldapUser.sAMAccountName,
          email: email,
          isAdmin: false,
          password: hashedPassword
        };
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);


// ------------------
// Serialize / Deserialize
// ------------------
passport.serializeUser((user, done) => done(null, user.uid || user.id));
passport.deserializeUser(async (id, done) => {
  try {
    // Əgər user MySQL-dəndirsə
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length > 0) return done(null, rows[0]);

    // Əgər user LDAP-dandırsa → birbaşa id qaytar
    return done(null, { uid: id });
  } catch (err) {
    done(err);
  }
});

export default passport;
