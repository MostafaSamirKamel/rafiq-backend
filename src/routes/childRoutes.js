const express = require('express');
const { createChild, getMyChildren, getChildById } = require('../controllers/childController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, upload.single('photo'), createChild)
    .get(protect, getMyChildren);

router.route('/:id')
    .get(protect, getChildById);

module.exports = router;
