const express = require('express');
const { addItem, getItems, startSession, submitQuiz } = require('../controllers/phase1Controller');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/items', protect, upload.single('photo'), addItem);
router.get('/items/:childId', protect, getItems);
router.post('/start-session', protect, startSession);
router.post('/quiz', protect, submitQuiz);

module.exports = router;
