import express from 'express';
import Chat from '../models/Chat.js';
import { getAiResponse } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Protect all chat routes

// Get all chat sessions (summary)
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Chat.find({ userId: req.user.id }, 'sessionId title updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat history by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chat = await Chat.findOne({ sessionId, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete chat by session ID
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await Chat.deleteOne({ sessionId, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all chat sessions for user
router.delete('/all', async (req, res) => {
  try {
    const result = await Chat.deleteMany({ userId: req.user.id });
    res.json({ message: 'All sessions deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  try {
    const { sessionId, content, language } = req.body;
    let currentSessionId = sessionId;

    let chat;
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      chat = new Chat({ sessionId: currentSessionId, userId: req.user.id, title, messages: [] });
    } else {
      chat = await Chat.findOne({ sessionId: currentSessionId, userId: req.user.id });
      if (!chat) {
         const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
         chat = new Chat({ sessionId: currentSessionId, userId: req.user.id, title, messages: [] });
      }
    }

    // Add user message
    const userMessage = { role: 'user', content };
    chat.messages.push(userMessage);

    // Prepare history for AI
    const historyForAi = chat.messages.map(m => ({ role: m.role, content: m.content }));

    // Get AI response
    const aiResponseContent = await getAiResponse(historyForAi, language);

    // Add AI message
    const aiMessage = { role: 'assistant', content: aiResponseContent };
    chat.messages.push(aiMessage);

    chat.updatedAt = Date.now();
    await chat.save();

    res.json({ sessionId: currentSessionId, message: aiMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
