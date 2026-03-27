const mongoose = require('mongoose');

const recognitionItemSchema = new mongoose.Schema({
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child',
        required: true,
    },
    type: {
        type: String,
        enum: ['person', 'place', 'object'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    relation: {
        type: String, // e.g., Father, Mother (for persons)
    },
    category: {
        type: String, // e.g., Vegetable, Animal (for objects), Home, School (for places)
    },
    photoUrl: {
        type: String,
        required: true,
    },
    audioUrl: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    videoPrompt: {
        type: String,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const RecognitionItem = mongoose.model('RecognitionItem', recognitionItemSchema);
module.exports = RecognitionItem;
