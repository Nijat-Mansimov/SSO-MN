import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pool from "../db/dbConnection.js";
import bcrypt from "bcrypt";

// Local strategy for login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (rows.length === 0) return done(null, false, { message: "User not found" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return done(null, false);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
