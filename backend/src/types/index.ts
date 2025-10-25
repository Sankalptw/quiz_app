import { Request } from 'express';

// USER TYPES
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// What we send to frontend (never send password_hash!)
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  created_at: Date;
}

// REQUEST BODY TYPES
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// JWT PAYLOAD
// What we store inside the JWT token
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

// AUTHENTICATION RESPONSE
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserResponse;
  token?: string;
}

// ERROR RESPONSE
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// SUCCESS RESPONSE
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data?: T;
}

// Express Request with authenticated user
// After JWT verification, we attach user to request
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// TOPIC TYPES
export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: Date;
  question_count?: number;
}

// QUESTION TYPES
export interface Question {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  created_at: Date;
}

// Question without correct answer (sent to frontend during quiz)
export interface QuestionForQuiz {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
}

// QUIZ ATTEMPT TYPES
export interface QuizAttempt {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;
  completed_at: Date;
}

// USER ANSWER TYPES
export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
  time_taken: number;
  created_at: Date;
}

// QUIZ SUBMISSION
export interface QuizSubmission {
  topic_slug: string;
  answers: {
    question_id: string;
    selected_answer: number;
    time_taken: number;
  }[];
}

// QUIZ RESULT
export interface QuizResult {
  attempt_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  grade: string;
  feedback: string;
  time_taken: number;
  answers: {
    question_id: string;
    question: string;
    options: string[];
    selected_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
    difficulty: string;
  }[];
  topic_analysis: {
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  };
}