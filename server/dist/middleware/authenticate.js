"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
function authenticate(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized', message: 'You must be logged in to access this resource.' });
}
//# sourceMappingURL=authenticate.js.map