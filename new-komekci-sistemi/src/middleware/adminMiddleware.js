// Admin yoxlama middleware
export const isAdmin = (req, res, next) => {
  // İlk öncə user mövcudluğunu yoxla
  const user = req.user || (req.session && req.session.user);

  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // User mövcuddursa, rolunu yoxla
  if (user.role !== "admin") {
    return res.status(403).render('access-denied');
  }

  // Əgər admindirsə, növbəti middleware-ə keç
  next();
};
