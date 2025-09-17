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
    url: "ldap://your-ldap-server:389", // AD və ya OpenLDAP ünvanı
    bindDN: "cn=admin,dc=example,dc=com", // Bind istifadəçi
    bindCredentials: "admin_password", // onun parolu
    searchBase: "ou=users,dc=example,dc=com",
    searchFilter: "(uid={{username}})", // AD-də "sAMAccountName={{username}}" ola bilər
  },
};

passport.use(
  "ldapauth",
  new LdapStrategy(LDAP_OPTIONS, async (ldapUser, done) => {
    try {
      // ldapUser.uid və ya ldapUser.mail əsasında DB-də user axtar
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [ldapUser.uid]
      );

      let user;
      if (rows.length > 0) {
        // DB-də mövcud user
        user = rows[0];
      } else {
        // Əgər DB-də yoxdur → yeni user yarat
        const [result] = await pool.query(
          "INSERT INTO users (username, email, isAdmin) VALUES (?, ?, ?)",
          [ldapUser.uid, ldapUser.mail, false] // default admin = false
        );
        user = { id: result.insertId, username: ldapUser.uid, email: ldapUser.mail, isAdmin: false };
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
