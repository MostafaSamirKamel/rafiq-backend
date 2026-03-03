const mongoose = require('mongoose');

const videoJobSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true,
    },
    runwayJobId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'failed'],
        default: 'pending',
    },
    videoUrl: {
        type: String,
    },
    type: {
        type: String,
        enum: ['gesture', 'emotion'],
        required: true,
    },
    target: {
        type: String, // e.g., 'hello', 'happy'
        required: true,
    },
}, {
    timestamps: true,
});

const VideoJob = mongoose.model('VideoJob', videoJobSchema);
module.exports = VideoJob;
