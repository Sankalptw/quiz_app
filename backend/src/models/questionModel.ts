import { query } from '../config/database';
import { Question, QuestionForQuiz } from '../types';

/**
 * Get questions for a topic (for quiz taking - without correct answers)
 */
export const getQuestionsForQuiz = async (
  topicId: string,
  limit: number = 10,
  difficulty?: string
): Promise<QuestionForQuiz[]> => {
  let sql = `
    SELECT id, question, options, difficulty
    FROM questions
    WHERE topic_id = $1
  `;

  const params: any[] = [topicId];

  if (difficulty) {
    sql += ` AND difficulty = $2`;
    params.push(difficulty);
  }

  sql += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get full question details (including correct answer)
 */
export const getQuestionById = async (id: string): Promise<Question | null> => {
  const result = await query(
    'SELECT * FROM questions WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Get multiple questions by IDs
 */
export const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
  const result = await query(
    'SELECT * FROM questions WHERE id = ANY($1)',
    [ids]
  );

  return result.rows;
};