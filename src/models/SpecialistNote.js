const mongoose = require('mongoose');

const specialistNoteSchema = new mongoose.Schema({
    specialistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    visibleToParent: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const SpecialistNote = mongoose.model('SpecialistNote', specialistNoteSchema);
module.exports = SpecialistNote;
