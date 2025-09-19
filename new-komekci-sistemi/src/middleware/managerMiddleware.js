// Manager yoxlama middleware
export const isManager = (req, res, next) => {
  const user = (req.user) ? req.user : req.session.user;

  // İstifadəçi yoxdursa, 401 qaytar
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // İstifadəçi varsa, rolunu yoxla
  if (user.role !== "manager") {
    return res.status(403).render('access-denied');
  }

  // Managerdirsə, növbəti middleware-ə keç
  next();
};
