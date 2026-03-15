const Child = require('../models/Child');
const SpecialistNote = require('../models/SpecialistNote');
const Session = require('../models/Session');

// @desc    Get all children assigned to a specialist
// @route   GET /specialists/my-children
// @access  Private (Specialist)
const getMyChildrenSpecialist = async (req, res) => {
    const children = await Child.find({ specialistId: req.user._id });
    res.json(children);
};

// @desc    Update session settings for a child
// @route   PUT /specialists/session-settings/:childId
// @access  Private (Specialist)
const updateSessionSettings = async (req, res) => {
    const { phase1Enabled, phase2Enabled, phase3Enabled, duration, sessionsPerDay } = req.body;

    const child = await Child.findById(req.params.childId);

    if (!child) {
        res.status(404);
        throw new Error('Child not found');
    }

    if (child.specialistId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to manage this child');
    }

    child.sessionSettings = {
        phase1Enabled: phase1Enabled ?? child.sessionSettings.phase1Enabled,
        phase2Enabled: phase2Enabled ?? child.sessionSettings.phase2Enabled,
        phase3Enabled: phase3Enabled ?? child.sessionSettings.phase3Enabled,
        duration: duration ?? child.sessionSettings.duration,
        sessionsPerDay: sessionsPerDay ?? child.sessionSettings.sessionsPerDay,
    };

    await child.save();
    res.json(child);
};

// @desc    Add a note for a child
// @route   POST /specialists/notes
// @access  Private (Specialist)
const addNote = async (req, res) => {
    const { childId, note, visibleToParent } = req.body;

    const specialistNote = await SpecialistNote.create({
        specialistId: req.user._id,
        childId,
        note,
        visibleToParent,
    });

    res.status(201).json(specialistNote);
};

// @desc    Get notes for a child
// @route   GET /specialists/notes/:childId
// @access  Private (Parent/Specialist)
const getNotes = async (req, res) => {
    const filter = { childId: req.params.childId };

    // If user is parent, show only visible notes
    if (req.user.role === 'parent') {
        filter.visibleToParent = true;
    }

    const notes = await SpecialistNote.find(filter).sort('-createdAt');
    res.json(notes);
};

module.exports = {
    getMyChildrenSpecialist,
    updateSessionSettings,
    addNote,
    getNotes,
};
