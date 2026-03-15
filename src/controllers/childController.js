const Child = require('../models/Child');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Create a new child profile
// @route   POST /children
// @access  Private (Parent)
const createChild = async (req, res) => {
    try {
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
            const uploadToCloudinary = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'children' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
            };
            const result = await uploadToCloudinary(req.file.buffer);
            photoUrl = result.secure_url;
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
    } catch (error) {
        res.status(500).json({ message: error.message || 'حدث خطأ أثناء إنشاء ملف الطفل' });
    }
};

// @desc    Get all children for a parent
// @route   GET /children
// @access  Private (Parent)
const getMyChildren = async (req, res) => {
    const children = await Child.find({ parentId: req.user._id });
    res.json(children);
};

// @desc    Get child by ID
// @route   GET /children/:id
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

// @desc    Update child profile
// @route   PUT /children/:id
// @access  Private (Parent)
const updateChild = async (req, res) => {
    try {
        const child = await Child.findById(req.params.id);

        if (!child) {
            res.status(404);
            throw new Error('Child not found');
        }

        // Check ownership
        if (child.parentId.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this child profile');
        }

        // Handle photo upload if any
        if (req.file) {
            const uploadToCloudinary = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'children' },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
            };
            const result = await uploadToCloudinary(req.file.buffer);
            req.body.photoUrl = result.secure_url;
        }


        const updatedChild = await Child.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedChild);
    } catch (error) {
        res.status(500).json({ message: error.message || 'حدث خطأ أثناء تحديث ملف الطفل' });
    }
};

module.exports = { createChild, getMyChildren, getChildById, updateChild };
