import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/auth';

/**
 * AUTHENTICATION MIDDLEWARE
 * This is a "guard" that protects routes requiring login
 * 
 * How it works:
 * 1. Client sends request with JWT token in Authorization header
 * 2. Middleware extracts and verifies token
 * 3. If valid: adds user info to request, allows access
 * 4. If invalid: returns 401 Unauthorized error
 * 
 * Usage in routes:
 * router.get('/protected', authenticate, controller)
 *                          ^^^^^^^^^^^^ This middleware runs first
 * 
 * Token format in header:
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    // 2. Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
    }

    // 3. Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7); // "Bearer " is 7 characters

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is empty',
      });
    }

    // 4. Verify token using our utility function
    // This checks:
    // - Token signature is valid (not tampered)
    // - Token is not expired
    // - Token was created by our server
    const decoded = verifyToken(token);

    // 5. Attach user info to request object
    // Now any controller can access req.user
    req.user = decoded;

    // 6. Pass control to next middleware/controller
    next();
  } catch (error: any) {
    // Token verification failed
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * OPTIONAL AUTHENTICATION
 * For routes that work with or without login
 * Example: Public leaderboard (shows more if logged in)
 * 
 * Similar to authenticate but doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, just continue without user info
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user (don't fail)
    next();
  }
};