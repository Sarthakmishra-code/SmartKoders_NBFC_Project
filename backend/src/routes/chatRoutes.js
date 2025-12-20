import express from 'express';
import { sendMessage, getChatHistory, resetConversation } from '../controllers/chatController.js';

const router = express.Router();

router.post('/message', sendMessage);
router.get('/history/:userId', getChatHistory);
router.post('/reset', resetConversation);

export default router;