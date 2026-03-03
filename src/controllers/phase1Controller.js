const RecognitionItem = require('../models/RecognitionItem');
const Session = require('../models/Session');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Add a recognition item (person, place, object)
// @route   POST /api/v1/phase1/items
// @access  Private
const addItem = async (req, res) => {
    const { childId, type, name, relation, category } = req.body;

    let photoUrl = '';
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        photoUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
    } else if (type === 'place') {
        // Default placeholder for places if no image provided
        photoUrl = 'https://res.cloudinary.com/dkt7y7lzm/image/upload/v1/defaults/place-placeholder.png';
        // In a real scenario, I might generate a default image or use a fixed one
    } else {
        res.status(400);
        throw new Error('Photo is required for this item type');
    }

    const item = await RecognitionItem.create({
        childId,
        type,
        name,
        relation,
        category,
        photoUrl,
        isDefault: !req.file && type === 'place',
    });

    res.status(201).json(item);
};

// @desc    Get items for a child by type
// @route   GET /api/v1/phase1/items/:childId?type=person
// @access  Private
const getItems = async (req, res) => {
    const { type } = req.query;
    const filter = { childId: req.params.childId };
    if (type) filter.type = type;

    const items = await RecognitionItem.find(filter);
    res.json(items);
};

// @desc    Start Phase 1 training session
// @route   POST /api/v1/phase1/start-session
// @access  Private
const startSession = async (req, res) => {
    const { childId } = req.body;
    const session = await Session.create({
        childId,
        phase: 1,
    });
    res.status(201).json(session);
};

// @desc    Submit Phase 1 Quiz Result
// @route   POST /api/v1/phase1/quiz
// @access  Private
const submitQuiz = async (req, res) => {
    const { sessionId, correct } = req.body;
    const session = await Session.findById(sessionId);

    if (!session) {
        res.status(404);
        throw new Error('Session not found');
    }

    session.status = correct ? 'completed' : 'failed';
    session.endTime = Date.now();
    session.score = correct ? 100 : 0;
    await session.save();

    res.json({
        message: correct ? 'Passed' : 'Failed, please retry',
        session,
    });
};

module.exports = { addItem, getItems, startSession, submitQuiz };
