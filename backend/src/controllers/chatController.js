import MasterAgent from '../agents/MasterAgent.js';
import { getDatabase } from '../utils/initDatabase.js';

const masterAgent = new MasterAgent();

export const sendMessage = async (req, res) => {
  try {
    const { message, userId, applicationId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Message and userId are required'
      });
    }

    // Process message through MasterAgent
    const result = await masterAgent.processMessage(
      userId,
      message,
      applicationId
    );

    res.json(result);

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { applicationId, limit = 50 } = req.query;

    const db = await getDatabase();

    let query = 'SELECT * FROM conversations WHERE user_id = ?';
    const params = [userId];

    if (applicationId) {
      query += ' AND application_id = ?';
      params.push(applicationId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const conversations = await db.all(query, params);

    res.json({
      success: true,
      count: conversations.length,
      conversations: conversations.reverse() // Oldest first for display
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

export const resetConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Clear conversation context
    masterAgent.clearContext(userId);

    res.json({
      success: true,
      message: 'Conversation context reset successfully'
    });

  } catch (error) {
    console.error('Reset conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset conversation',
      error: error.message
    });
  }
};