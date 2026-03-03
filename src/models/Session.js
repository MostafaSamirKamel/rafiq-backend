const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true,
    },
    phase: {
        type: Number,
        enum: [1, 2, 3],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'failed'],
        default: 'active',
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: {
        type: Date,
    },
    score: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
