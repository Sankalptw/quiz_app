import { Request, Response } from 'express';
import { getAllTopics, getTopicBySlug } from '../models/topicModel';

/**
 * GET ALL TOPICS
 * Fetch all available quiz topics
 * 
 * GET /api/topics
 */
export const getTopics = async (req: Request, res: Response) => {
  try {
    const topics = await getAllTopics();

    res.status(200).json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error: any) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message,
    });
  }
};

/**
 * GET SINGLE TOPIC
 * Fetch topic details by slug
 * 
 * GET /api/topics/:slug
 */
export const getTopicDetails = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const topic = await getTopicBySlug(slug);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    res.status(200).json({
      success: true,
      topic,
    });
  } catch (error: any) {
    console.error('Get topic details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic details',
      error: error.message,
    });
  }
};