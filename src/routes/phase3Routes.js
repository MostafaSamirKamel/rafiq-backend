const express = require('express');
const { evaluateSpeech, aiChat, speechToSpeech } = require('../controllers/phase3Controller');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/evaluate-response', protect, evaluateSpeech);
router.post('/ai-chat', protect, aiChat);
router.post('/speech-to-speech', protect, speechToSpeech);

module.exports = router;
