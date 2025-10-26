import { Request, Response } from 'express';
import { query } from '../config/database';

/**
 * GET GLOBAL LEADERBOARD
 * Top players by total score
 */
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        COUNT(qa.id) as total_quizzes,
        SUM(qa.score) as total_score,
        AVG(qa.percentage) as avg_percentage,
        ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC) as rank
      FROM users u
      JOIN quiz_attempts qa ON u.id = qa.user_id
      GROUP BY u.id, u.username
      ORDER BY total_score DESC
      LIMIT $1
    `, [limit]);

    res.status(200).json({
      success: true,
      leaderboard: result.rows,
    });
  } catch (error: any) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

/**
 * GET TODAY'S LEADERBOARD
 */
export const getTodayLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        COUNT(qa.id) as quizzes_today,
        SUM(qa.score) as score_today,
        AVG(qa.percentage) as avg_percentage,
        ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC) as rank
      FROM users u
      JOIN quiz_attempts qa ON u.id = qa.user_id
      WHERE DATE(qa.completed_at) = CURRENT_DATE
      GROUP BY u.id, u.username
      ORDER BY score_today DESC
      LIMIT $1
    `, [limit]);

    res.status(200).json({
      success: true,
      leaderboard: result.rows,
    });
  } catch (error: any) {
    console.error('Get today leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s leaderboard',
      error: error.message,
    });
  }
};

/**
 * GET TOPIC LEADERBOARD
 */
export const getTopicLeaderboard = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        COUNT(qa.id) as attempts,
        MAX(qa.score) as best_score,
        MAX(qa.percentage) as best_percentage,
        ROW_NUMBER() OVER (ORDER BY MAX(qa.score) DESC, MIN(qa.time_taken) ASC) as rank
      FROM users u
      JOIN quiz_attempts qa ON u.id = qa.user_id
      WHERE qa.topic_id = $1
      GROUP BY u.id, u.username
      ORDER BY best_score DESC, MIN(qa.time_taken) ASC
      LIMIT $2
    `, [topicId, limit]);

    res.status(200).json({
      success: true,
      leaderboard: result.rows,
    });
  } catch (error: any) {
    console.error('Get topic leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic leaderboard',
      error: error.message,
    });
  }
};

/**
 * GET USER RANK
 */
export const getUserRank = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(`
      WITH ranked_users AS (
        SELECT 
          u.id,
          u.username,
          SUM(qa.score) as total_score,
          ROW_NUMBER() OVER (ORDER BY SUM(qa.score) DESC) as rank
        FROM users u
        JOIN quiz_attempts qa ON u.id = qa.user_id
        GROUP BY u.id, u.username
      )
      SELECT * FROM ranked_users WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or has no quiz attempts',
      });
    }

    res.status(200).json({
      success: true,
      rank: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message,
    });
  }
};