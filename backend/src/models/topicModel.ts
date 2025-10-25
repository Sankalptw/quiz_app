import { query } from '../config/database';
import { Topic } from '../types';

/**
 * Get all active topics with question count
 */
export const getAllTopics = async (): Promise<Topic[]> => {
  const result = await query(`
    SELECT 
      t.*,
      COUNT(q.id) as question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    WHERE t.is_active = true
    GROUP BY t.id
    ORDER BY t.created_at ASC
  `);

  return result.rows;
};

/**
 * Get single topic by slug
 */
export const getTopicBySlug = async (slug: string): Promise<Topic | null> => {
  const result = await query(`
    SELECT 
      t.*,
      COUNT(q.id) as question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    WHERE t.slug = $1 AND t.is_active = true
    GROUP BY t.id
  `, [slug]);

  return result.rows[0] || null;
};

/**
 * Get topic by ID
 */
export const getTopicById = async (id: string): Promise<Topic | null> => {
  const result = await query(
    'SELECT * FROM topics WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
};