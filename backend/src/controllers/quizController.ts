import { Response } from 'express';
import { AuthRequest, QuizSubmission } from '../types';
import { getTopicBySlug } from '../models/topicModel';
import { getQuestionsForQuiz, getQuestionsByIds } from '../models/questionModel';
import { createQuizAttempt, saveUserAnswer, getUserQuizHistory, getUserStats } from '../models/quizModel';

/**
 * START QUIZ
 * Get random questions for a topic
 * 
 * GET /api/quiz/start/:topicSlug
 */
export const startQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { topicSlug } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get topic
    const topic = await getTopicBySlug(topicSlug);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    // Get random questions (without correct answers)
    const questions = await getQuestionsForQuiz(topic.id, limit);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available for this topic',
      });
    }

    res.status(200).json({
      success: true,
      topic: {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        description: topic.description,
        icon: topic.icon,
      },
      questions,
      total_questions: questions.length,
      time_per_question: 30, // seconds
    });
  } catch (error: any) {
    console.error('Start quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz',
      error: error.message,
    });
  }
};

/**
 * SUBMIT QUIZ
 * Calculate score and save results
 * 
 * POST /api/quiz/submit
 */
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { topic_slug, answers, total_time } = req.body as QuizSubmission & { total_time: number };

    // Validate input
    if (!topic_slug || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz submission data',
      });
    }

    // Get topic
    const topic = await getTopicBySlug(topic_slug);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found',
      });
    }

    // Get question IDs
    const questionIds = answers.map((a) => a.question_id);

    // Fetch correct answers
    const questions = await getQuestionsByIds(questionIds);

    // Create a map for quick lookup
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Calculate score
    let correctCount = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.question_id);

      if (!question) continue;

      const isCorrect = answer.selected_answer === question.correct_answer;
      if (isCorrect) correctCount++;

      detailedAnswers.push({
        question_id: question.id,
        question: question.question,
        options: question.options,
        selected_answer: answer.selected_answer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        explanation: question.explanation,
        difficulty: question.difficulty,
        time_taken: answer.time_taken || 0,
      });
    }

    const totalQuestions = answers.length;
    const percentage = (correctCount / totalQuestions) * 100;

    // Calculate grade
    let grade = 'F';
    let feedback = 'Keep practicing! Focus on understanding the concepts.';

    if (percentage >= 90) {
      grade = 'A+';
      feedback = '🌟 Outstanding! You\'re in the top tier! Keep up the excellent work!';
    } else if (percentage >= 80) {
      grade = 'A';
      feedback = '🎉 Excellent work! You have a strong grasp of this topic!';
    } else if (percentage >= 70) {
      grade = 'B+';
      feedback = '💪 Great job! Review the questions you missed to improve further.';
    } else if (percentage >= 60) {
      grade = 'B';
      feedback = '👍 Good effort! Focus on your weak areas to reach the next level.';
    } else if (percentage >= 50) {
      grade = 'C';
      feedback = '📚 Fair performance. More practice will help solidify your understanding.';
    } else if (percentage >= 40) {
      grade = 'D';
      feedback = '🎯 You\'re getting there! Review the basics and try again.';
    }

    // Save quiz attempt
    const attempt = await createQuizAttempt(
      req.user.userId,
      topic.id,
      correctCount,
      totalQuestions,
      percentage,
      total_time || 0
    );

    // Save individual answers
    for (const answer of detailedAnswers) {
      await saveUserAnswer(
        attempt.id,
        answer.question_id,
        answer.selected_answer,
        answer.is_correct,
        answer.time_taken
      );
    }

    // Topic-wise analysis
    const topicAnalysis = {
      topic: topic.name,
      correct: correctCount,
      total: totalQuestions,
      percentage: percentage,
    };

    // Send response
    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        attempt_id: attempt.id,
        score: correctCount,
        total_questions: totalQuestions,
        percentage: parseFloat(percentage.toFixed(2)),
        grade,
        feedback,
        time_taken: total_time || 0,
        answers: detailedAnswers,
        topic_analysis: topicAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message,
    });
  }
};

/**
 * GET QUIZ HISTORY
 * Get user's past quiz attempts
 * 
 * GET /api/quiz/history
 */
export const getQuizHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;

    const history = await getUserQuizHistory(req.user.userId, limit);

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: any) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz history',
      error: error.message,
    });
  }
};

/**
 * GET USER STATS
 * Get user's overall statistics
 * 
 * GET /api/quiz/stats
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const stats = await getUserStats(req.user.userId);

    res.status(200).json({
      success: true,
      stats: {
        total_quizzes: parseInt(stats.total_quizzes) || 0,
        avg_score: parseFloat(stats.avg_score) || 0,
        total_points: parseInt(stats.total_points) || 0,
        topics_attempted: parseInt(stats.topics_attempted) || 0,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message,
    });
  }
};