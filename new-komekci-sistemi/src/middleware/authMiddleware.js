// Ümumi authenticated yoxlama
export const isAuthenticated = (req, res, next) => {
    if ((req.session && req.session.user) || (req.isAuthenticated && req.isAuthenticated())) {
        return next();
    }
    res.redirect('/login');
};

// SSO ilə daxil olan istifadəçilər üçün
export const isSSOAuthenticated = (req, res, next) => {
    const user = req.session && req.session.user;
    if (user && user.ssoLogin) {
        return next();
    }
    res.redirect('/login');
};
