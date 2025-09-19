// Technician yoxlama middleware
export const isTechnician = (req, res, next) => {
  const user = req.user || req.session.user;

  // İstifadəçi yoxdursa, 401 qaytar
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // İstifadəçi varsa, rolunu yoxla
  if (user.role !== "technician") {
    return res.status(403).render('access-denied');
  }

  // Techniciandirsə, növbəti middleware-ə keç
  next();
};
