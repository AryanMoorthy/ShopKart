const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

// @desc    Register a new customer
// @route   POST /customers/register
// @access  Public
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Validation: All fields mandatory
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory (fullName, email, password, phone)'
      });
    }

    // Validation: Password length at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters'
      });
    }

    // Validation: Unique email check
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create customer (password hashed automatically by pre-save hook in model)
    const customer = await Customer.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Login customer & get token in cookie
// @route   POST /customers/login
// @access  Public
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });

    // Compare password using bcrypt
    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT and set HttpOnly cookie
    generateToken(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get currently logged in customer profile
// @route   GET /customers/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      wishlist: req.user.wishlist || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Logout customer & clear cookie
// @route   POST /customers/logout
// @access  Private / Public
const logoutCustomer = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      expires: new Date(0)
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Bonus: Change password API
// @route   PATCH /customers/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 6 characters'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const isMatch = await customer.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid old password'
      });
    }

    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword
};
