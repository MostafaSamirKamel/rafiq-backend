const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        let { phone, password, role, fullName } = req.body;
        
        // Trim whitespace to prevent validation mismatch
        phone = phone?.trim();
        password = password?.trim();
        fullName = fullName?.trim();

        const userExists = await User.findOne({ phone });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            phone,
            password,
            role,
            fullName,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                phone: user.phone,
                role: user.role,
                fullName: user.fullName,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        let { phone, password } = req.body;
        
        // Trim whitespace to prevent validation mismatch
        phone = phone?.trim();
        password = password?.trim();

        const user = await User.findOne({ phone });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                phone: user.phone,
                role: user.role,
                fullName: user.fullName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid phone or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = {
            _id: req.user._id,
            phone: req.user.phone,
            role: req.user.role,
            fullName: req.user.fullName,
        };
        res.json(user);
    } catch (error) {
        next(error);
    }
};


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = { registerUser, loginUser, getMe };
