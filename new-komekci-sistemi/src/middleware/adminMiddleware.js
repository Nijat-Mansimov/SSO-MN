// Manager yoxlama middleware
export const isAdmin = (req, res, next) => {
  // Passport session vasitəsilə user mövcudluğunu yoxlayırıq
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // User mövcuddursa, rolunu yoxlayırıq
  if (req.user.role !== "admin") {
    return res.status(403).render('access-denied');
  }

  // Əgər managerdirsə, növbəti middleware-ə keç
  next();
};
