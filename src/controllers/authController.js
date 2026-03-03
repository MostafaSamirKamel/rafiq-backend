const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { phone, password, role, fullName } = req.body;

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
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { phone, password } = req.body;

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
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = { registerUser, loginUser };
