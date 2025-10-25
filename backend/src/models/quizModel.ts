import { query } from '../config/database';
import { QuizAttempt, UserAnswer } from '../types';

/**
 * Create a new quiz attempt
 */
export const createQuizAttempt = async (
  userId: string,
  topicId: string,
  score: number,
  totalQuestions: number,
  percentage: number,
  timeTaken: number
): Promise<QuizAttempt> => {
  const result = await query(`
    INSERT INTO quiz_attempts (user_id, topic_id, score, total_questions, percentage, time_taken)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [userId, topicId, score, totalQuestions, percentage, timeTaken]);

  return result.rows[0];
};

/**
 * Save user answer
 */
export const saveUserAnswer = async (
  attemptId: string,
  questionId: string,
  selectedAnswer: number,
  isCorrect: boolean,
  timeTaken: number
): Promise<UserAnswer> => {
  const result = await query(`
    INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct, time_taken)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [attemptId, questionId, selectedAnswer, isCorrect, timeTaken]);

  return result.rows[0];
};

/**
 * Get user's quiz history
 */
export const getUserQuizHistory = async (userId: string, limit: number = 10) => {
  const result = await query(`
    SELECT 
      qa.*,
      t.name as topic_name,
      t.slug as topic_slug,
      t.icon as topic_icon
    FROM quiz_attempts qa
    JOIN topics t ON qa.topic_id = t.id
    WHERE qa.user_id = $1
    ORDER BY qa.completed_at DESC
    LIMIT $2
  `, [userId, limit]);

  return result.rows;
};

/**
 * Get user's overall statistics
 */
export const getUserStats = async (userId: string) => {
  const result = await query(`
    SELECT 
      COUNT(*) as total_quizzes,
      AVG(percentage) as avg_score,
      SUM(score) as total_points,
      COUNT(DISTINCT topic_id) as topics_attempted
    FROM quiz_attempts
    WHERE user_id = $1
  `, [userId]);

  return result.rows[0];
};