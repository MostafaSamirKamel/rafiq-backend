const express = require('express');
const {
    getMyChildrenSpecialist,
    updateSessionSettings,
    addNote,
    getNotes,
} = require('../controllers/specialistController');
const { protect, specialistOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/my-children', protect, specialistOnly, getMyChildrenSpecialist);
router.put('/session-settings/:childId', protect, specialistOnly, updateSessionSettings);
router.post('/notes', protect, specialistOnly, addNote);
router.get('/notes/:childId', protect, getNotes);

module.exports = router;
