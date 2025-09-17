export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user && req.user.isAdmin) {
      return next(); // User is logged in and is admin
    }
    // Logged in but not admin
    return res.status(403).send("Access denied. Admins only.");
  }
  // Not logged in
  res.redirect("/login");
};
