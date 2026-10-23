"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Do not leak stack traces in production
    const body = {
        error: statusCode === 500 ? 'Internal Server Error' : message,
        message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : message,
    };
    if (process.env.NODE_ENV !== 'production') {
        body.stack = err.stack;
    }
    res.status(statusCode).json(body);
}
//# sourceMappingURL=errorHandler.js.map