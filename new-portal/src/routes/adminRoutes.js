import express from "express";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { getUsers, createUser, deleteUser, updateUser  } from "../controllers/adminControllers.js";

const router = express.Router();

// Get all users (admin-only)
router.get("/users", isAdmin, getUsers);

// Create user (admin-only)
router.post("/users", isAdmin, createUser);

// Delete user (admin-only)
router.delete("/users/:id", isAdmin, deleteUser);

// Update user (admin-only)
router.put("/users/:id", isAdmin, updateUser);

export { router };
