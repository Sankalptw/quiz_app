import { query } from '../config/database';
import { User, UserResponse } from '../types';

/**
 * USER MODEL
 * This file contains all database operations related to users
 * Think of it as the "data layer" - it talks to the database
 * Controllers will call these functions
 */

/**
 * CREATE USER
 * Inserts a new user into the database
 * 
 * Why RETURNING *?
 * - After INSERT, we want to get the newly created user
 * - Includes auto-generated fields like id, created_at
 * 
 * @param username - Unique username
 * @param email - Unique email
 * @param passwordHash - Already hashed password (never store plain!)
 * @returns Newly created user object
 */
export const createUser = async (
  username: string,
  email: string,
  passwordHash: string
): Promise<User> => {
  const result = await query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, passwordHash]
  );

  // result.rows[0] contains the inserted user
  return result.rows[0];
};

/**
 * FIND USER BY EMAIL
 * Used during login to check if user exists
 * 
 * Why by email?
 * - Users login with email + password
 * - Email is unique (indexed for fast lookup)
 * 
 * @param email - User's email
 * @returns User object or null if not found
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  // If no user found, rows will be empty
  return result.rows[0] || null;
};

/**
 * FIND USER BY ID
 * Used when verifying JWT token
 * Token contains userId, we fetch full user details
 * 
 * @param id - User's UUID
 * @returns User object or null if not found
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
};

/**
 * CHECK IF EMAIL EXISTS
 * Quick check during signup to prevent duplicates
 * Faster than trying to insert and catching error
 * 
 * @param email - Email to check
 * @returns true if email exists, false otherwise
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const result = await query(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
    [email]
  );

  // PostgreSQL EXISTS returns boolean
  return result.rows[0].exists;
};

/**
 * CHECK IF USERNAME EXISTS
 * Quick check during signup to prevent duplicates
 * 
 * @param username - Username to check
 * @returns true if username exists, false otherwise
 */
export const usernameExists = async (username: string): Promise<boolean> => {
  const result = await query(
    'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
    [username]
  );

  return result.rows[0].exists;
};

/**
 * UPDATE USER
 * For future features (profile updates, password change, etc.)
 * Not used in Stage 1, but good to have
 * 
 * @param id - User's UUID
 * @param updates - Object containing fields to update
 * @returns Updated user object
 */
export const updateUser = async (
  id: string,
  updates: Partial<Pick<User, 'username' | 'email'>>
): Promise<User> => {
  // Build dynamic UPDATE query based on which fields are provided
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  // Create SET clause: SET username = $1, email = $2
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const result = await query(
    `UPDATE users 
     SET ${setClause}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
};

/**
 * SANITIZE USER FOR RESPONSE
 * Remove sensitive data before sending to frontend
 * NEVER send password_hash to client!
 * 
 * @param user - Full user object from database
 * @returns Safe user object without sensitive data
 */
export const sanitizeUser = (user: User): UserResponse => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
  };
};