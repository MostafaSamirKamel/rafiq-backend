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
        enum: ['gesture', 'emotion', 'recognition'],
        required: true,
    },
    recognitionItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecognitionItem',
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
