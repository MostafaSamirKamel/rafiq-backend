const express = require('express');
const { addItem, getItems, startSession, submitQuiz, deleteItem } = require('../controllers/phase1Controller');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.post('/items', protect, upload.single('photo'), addItem);
router.get('/items/:childId', protect, getItems);
router.post('/start-session', protect, startSession);
router.post('/quiz', protect, submitQuiz);
router.delete('/items/:id', protect, deleteItem);

module.exports = router;
