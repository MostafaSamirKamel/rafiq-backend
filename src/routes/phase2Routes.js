const express = require('express');
const { generateVideo, getVideoStatus } = require('../controllers/phase2Controller');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/generate-video', protect, generateVideo);
router.get('/video-status/:jobId', protect, getVideoStatus);

module.exports = router;
