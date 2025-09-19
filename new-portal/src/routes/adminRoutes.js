import express from "express";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { getUsers, createUser, deleteUser, getUserServices, updateUser, getAllServices, createService, updateService, deleteService, assignServiceToUser, removeServiceFromUser  } from "../controllers/adminControllers.js";

const router = express.Router();

// ======================= USERS =======================
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ======================= SERVICES =======================
router.get("/services", getAllServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// ======================= USER_SERVICES =======================
router.post("/user-services/assign", assignServiceToUser
);
router.post("/user-services/remove", removeServiceFromUser);
router.get("/user-services", getUserServices);

export { router };
