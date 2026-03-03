const express = require('express');
const { getProgressOverview, exportReport } = require('../controllers/progressController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:childId/overview', protect, getProgressOverview);
router.get('/:childId/export', protect, exportReport);

module.exports = router;
