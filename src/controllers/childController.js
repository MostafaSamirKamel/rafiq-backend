const Child = require('../models/Child');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new child profile
// @route   POST /api/v1/children
// @access  Private (Parent)
const createChild = async (req, res) => {
    const {
        name,
        birthdate,
        gender,
        governorate,
        school,
        iqScore,
        healthStatus,
        treatmentCenter,
        specialistPhone,
    } = req.body;

    let photoUrl = '';
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        photoUrl = result.secure_url;
        // Delete local file
        fs.unlinkSync(req.file.path);
    }

    let specialistId = null;
    if (specialistPhone) {
        const specialist = await User.findOne({ phone: specialistPhone, role: 'specialist' });
        if (specialist) {
            specialistId = specialist._id;
        }
    }

    const child = await Child.create({
        parentId: req.user._id,
        specialistId,
        name,
        birthdate,
        gender,
        photoUrl,
        governorate,
        school,
        iqScore,
        healthStatus,
        treatmentCenter,
    });

    if (child) {
        res.status(201).json(child);
    } else {
        res.status(400);
        throw new Error('Invalid child data');
    }
};

// @desc    Get all children for a parent
// @route   GET /api/v1/children
// @access  Private (Parent)
const getMyChildren = async (req, res) => {
    const children = await Child.find({ parentId: req.user._id });
    res.json(children);
};

// @desc    Get child by ID
// @route   GET /api/v1/children/:id
// @access  Private (Parent/Specialist)
const getChildById = async (req, res) => {
    const child = await Child.findById(req.params.id);

    if (child) {
        // Check if user is parent or assigned specialist
        if (
            child.parentId.toString() === req.user._id.toString() ||
            (child.specialistId && child.specialistId.toString() === req.user._id.toString())
        ) {
            res.json(child);
        } else {
            res.status(403);
            throw new Error('Not authorized to view this child');
        }
    } else {
        res.status(404);
        throw new Error('Child not found');
    }
};

module.exports = { createChild, getMyChildren, getChildById };
