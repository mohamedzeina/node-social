const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 *
 * This middleware:
 * - Checks for an Authorization header in the incoming request
 * - Extracts and verifies the JWT token
 * - If valid: attaches `userId` and sets `req.isAuth = true`
 * - If invalid or missing: sets `req.isAuth = false`
 *
 * Usage: Add this middleware to routes that require authentication
 */

module.exports = (req, res, next) => {
  // Expect header format: "Authorization: Bearer <token>"
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  // Extract token (skip "Bearer ")
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    // Verify token with secret key
    decodedToken = jwt.verify(token, 'secretString');
  } catch (err) {
    req.isAuth = false; // Token verification failed
    return next();
  }
  if (!decodedToken) {
    // If token couldn't be decoded, reject the request
    req.isAuth = false;
    return next();
  }
  // Attach user ID from token payload for later use in controllers
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
