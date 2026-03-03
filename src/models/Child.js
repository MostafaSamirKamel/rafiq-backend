const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    specialistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
    },
    birthdate: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
    },
    photoUrl: {
        type: String,
    },
    governorate: {
        type: String,
        required: true,
    },
    school: {
        type: String,
    },
    iqScore: {
        type: Number,
    },
    healthStatus: {
        type: String,
    },
    treatmentCenter: {
        type: String,
    },
    sessionSettings: {
        phase1Enabled: { type: Boolean, default: true },
        phase2Enabled: { type: Boolean, default: false },
        phase3Enabled: { type: Boolean, default: false },
        duration: { type: Number, default: 20 },
        sessionsPerDay: { type: Number, default: 2 },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual for age calculation
childSchema.virtual('age').get(function () {
    if (!this.birthdate) return null;
    const today = new Date();
    const birthDate = new Date(this.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

const Child = mongoose.model('Child', childSchema);
module.exports = Child;
