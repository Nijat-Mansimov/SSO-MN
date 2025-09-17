// Authentication middleware
export const isAuthenticated = (req, res, next) => {
  // Passport session vasitəsilə yoxlayırıq
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next(); // istifadəçi login olub, növbəti middleware-ə keç
  }

  // Əks halda login səhifəsinə yönləndir və ya JSON ilə error qaytar
  res.status(401).json({ message: "Not authenticated" });
};
