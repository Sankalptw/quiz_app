import { Request, Response } from 'express';
import {
  createUser,
  findUserByEmail,
  findUserById,
  emailExists,
  usernameExists,
  sanitizeUser,
} from '../models/userModel';
import {
  hashPassword,
  comparePassword,
  generateToken,
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '../utils/auth';
import { SignupRequest, LoginRequest, AuthRequest } from '../types';

/**
 * CONTROLLERS
 * This is where business logic lives
 * Think of it as the "brain" that coordinates everything
 * 
 * Flow: Route → Controller → Model → Database
 *              ^^^^^^^^^^
 *              We are here
 */

/**
 * SIGNUP CONTROLLER
 * Handles user registration
 * 
 * Steps:
 * 1. Validate input (email format, password strength)
 * 2. Check if user already exists
 * 3. Hash password
 * 4. Create user in database
 * 5. Generate JWT token
 * 6. Send response with user data + token
 * 
 * POST /api/auth/signup
 * Body: { username, email, password }
 */
export const signup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    // 1. VALIDATE INPUT
    // Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate username
    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username',
        errors: usernameValidation.errors,
      });
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      });
    }

    // 2. CHECK IF USER ALREADY EXISTS
    // We check both email and username to give specific error messages
    const emailTaken = await emailExists(email);
    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const usernameTaken = await usernameExists(username);
    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // 3. HASH PASSWORD
    // NEVER store plain passwords!
    const passwordHash = await hashPassword(password);

    // 4. CREATE USER IN DATABASE
    const newUser = await createUser(username, email, passwordHash);

    // 5. GENERATE JWT TOKEN
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    // 6. SEND RESPONSE
    // Remove sensitive data (password_hash) before sending
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message,
    });
  }
};

/**
 * LOGIN CONTROLLER
 * Handles user authentication
 * 
 * Steps:
 * 1. Validate input
 * 2. Find user by email
 * 3. Verify password
 * 4. Generate JWT token
 * 5. Send response with user data + token
 * 
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDATE INPUT
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 2. FIND USER BY EMAIL
    const user = await findUserByEmail(email);

    if (!user) {
      // Don't reveal whether email exists (security)
      // Same error message for wrong email or password
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. VERIFY PASSWORD
    const isPasswordCorrect = await comparePassword(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. GENERATE JWT TOKEN
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // 5. SEND RESPONSE
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

/**
 * GET CURRENT USER (ME)
 * Returns current logged-in user's information
 * This route is PROTECTED - requires valid JWT token
 * 
 * Steps:
 * 1. User info already attached to req by authenticate middleware
 * 2. Fetch fresh user data from database
 * 3. Send user data
 * 
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // req.user was set by authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Fetch fresh user data from database
    // Why? User might have updated their profile
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * LOGOUT CONTROLLER
 * In JWT authentication, logout is mostly handled on frontend
 * (Frontend deletes the token from storage)
 * 
 * But we can:
 * - Log the logout event
 * - Clear cookies if using HTTP-only cookies
 * - Add token to blacklist (advanced feature)
 * 
 * For now, we just send a success message
 * 
 * POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a more advanced system, you might:
    // 1. Add token to a blacklist/Redis
    // 2. Clear HTTP-only cookies
    // 3. Log the logout event
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
}