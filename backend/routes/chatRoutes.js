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
    const sessions = await Chat.find({ userId: req.user.id }, 'sessionId title isPinned updatedAt')
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(50);
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

// Update chat session (e.g. title or isPinned)
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, isPinned } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const result = await Chat.findOneAndUpdate(
      { sessionId, userId: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(result);
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

// Post a new message with SSE Streaming
router.post('/', async (req, res) => {
  let chat = null;
  let currentSessionId = req.body.sessionId;
  try {
    const { content, language, model } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const trimmedContent = content.trim();
    const userMessage = { role: 'user', content: trimmedContent };
    let isNewSession = false;

    if (!currentSessionId) {
      currentSessionId = uuidv4();
      isNewSession = true;
      const initialTitle = trimmedContent.length > 35 
        ? trimmedContent.substring(0, 35) + '...' 
        : trimmedContent;
      chat = new Chat({
        sessionId: currentSessionId,
        userId: req.user.id,
        title: initialTitle,
        messages: [userMessage],
        updatedAt: Date.now()
      });
    } else {
      chat = await Chat.findOne({ sessionId: currentSessionId, userId: req.user.id });
      if (!chat) {
        isNewSession = true;
        const initialTitle = trimmedContent.length > 35 
          ? trimmedContent.substring(0, 35) + '...' 
          : trimmedContent;
        chat = new Chat({
          sessionId: currentSessionId,
          userId: req.user.id,
          title: initialTitle,
          messages: [userMessage],
          updatedAt: Date.now()
        });
      } else {
        chat.messages.push(userMessage);
        chat.updatedAt = Date.now();
      }
    }

    // Persist immediately so the session exists even before AI streams
    await chat.save();

    // Prepare history for AI
    const historyForAi = chat.messages.map(m => ({ role: m.role, content: m.content }));

    // Generate intelligent title in the background without blocking stream
    if (isNewSession) {
      import('../services/aiService.js').then(({ generateTitle }) => {
        generateTitle(trimmedContent, language, model)
          .then(async (newTitle) => {
            if (newTitle && newTitle !== 'New Chat') {
              await Chat.updateOne(
                { sessionId: currentSessionId, userId: req.user.id },
                { $set: { title: newTitle } }
              );
            }
          })
          .catch(e => console.error("Background title generation error:", e.message));
      });
    }

    // Setup SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send sessionId immediately so the frontend knows it
    res.write(`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`);

    // Stream AI response and collect full text
    const { streamAiResponse } = await import('../services/aiService.js');
    const aiResponseContent = await streamAiResponse(historyForAi, language, res);

    // Save AI response to DB BEFORE sending [DONE] signal
    const aiMessage = { role: 'assistant', content: aiResponseContent };
    chat.messages.push(aiMessage);
    chat.updatedAt = Date.now();
    await chat.save();

    // End stream signal
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error("Chat message route error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      const friendlyMessage = isRateLimit 
        ? "⚠️ **AI Service Rate Limit (429)**\n\nGoogle Gemini's free tier request limit was temporarily reached due to frequent requests. Please wait **15–30 seconds** and try again."
        : `⚠️ **Service Error**: ${err.message}`;

      const fallbackJson = JSON.stringify({
        blocks: [{ type: "markdown", content: friendlyMessage }]
      });

      if (chat) {
        try {
          chat.messages.push({ role: 'assistant', content: fallbackJson });
          chat.updatedAt = Date.now();
          await chat.save();
        } catch (saveErr) {
          console.error("Failed to save error message into chat:", saveErr.message);
        }
      }

      res.write(`data: ${JSON.stringify({ content: fallbackJson })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
});

// Post a regenerate request
router.post('/regenerate', async (req, res) => {
  let chat = null;
  try {
    const { sessionId, messageIndex, language, model } = req.body;
    
    if (!sessionId || messageIndex === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    chat = await Chat.findOne({ sessionId, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Truncate messages from messageIndex onwards and persist immediately
    chat.messages = chat.messages.slice(0, messageIndex);
    chat.updatedAt = Date.now();
    await chat.save();
    
    // The new history should end with the user's prompt
    const historyForAi = chat.messages.map(m => ({ role: m.role, content: m.content }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { streamAiResponse } = await import('../services/aiService.js');
    const aiResponseContent = await streamAiResponse(historyForAi, language, res);

    const aiMessage = { role: 'assistant', content: aiResponseContent };
    chat.messages.push(aiMessage);
    chat.updatedAt = Date.now();
    await chat.save();

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (err) {
    console.error("Regenerate route error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      const friendlyMessage = isRateLimit 
        ? "⚠️ **AI Service Rate Limit (429)**\n\nGoogle Gemini's free tier request limit was temporarily reached. Please wait **15–30 seconds** and retry."
        : `⚠️ **Service Error**: ${err.message}`;

      const fallbackJson = JSON.stringify({
        blocks: [{ type: "markdown", content: friendlyMessage }]
      });

      if (chat) {
        try {
          chat.messages.push({ role: 'assistant', content: fallbackJson });
          chat.updatedAt = Date.now();
          await chat.save();
        } catch (saveErr) {
          console.error("Failed to save error message on regenerate:", saveErr.message);
        }
      }

      res.write(`data: ${JSON.stringify({ content: fallbackJson })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
});

// Update feedback for a message
router.put('/:sessionId/message/:messageIndex/feedback', async (req, res) => {
  try {
    const { sessionId, messageIndex } = req.params;
    const { feedback } = req.body; // 'up', 'down', or null

    const chat = await Chat.findOne({ sessionId, userId: req.user.id });
    if (!chat) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (chat.messages[messageIndex]) {
      chat.messages[messageIndex].feedback = feedback;
      await chat.save();
      res.json({ message: 'Feedback updated' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
