// Manager yoxlama middleware
export const isTechnician = (req, res, next) => {
  // Passport session vasitəsilə user mövcudluğunu yoxlayırıq
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // User mövcuddursa, rolunu yoxlayırıq
  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Access denied: Technician and Manager only" });
  }

  // Əgər managerdirsə, növbəti middleware-ə keç
  next();
};
