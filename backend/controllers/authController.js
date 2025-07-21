const User = require('../models/User');
const OTP = require('../models/OTP');
const AuthorityRequest = require('../models/AuthorityRequest');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../config/mailer');
const jwt = require('jsonwebtoken');

// Utility function for polygon validation
const validatePolygon = (polygon) => {
  if (!polygon || typeof polygon !== 'object') {
    return { valid: false, message: 'No polygon provided' };
  }

  if (polygon.type !== 'Polygon') {
    return { valid: false, message: 'Type must be "Polygon"' };
  }

  if (!Array.isArray(polygon.coordinates)) {
    return { valid: false, message: 'Invalid coordinates structure' };
  }

  const rings = polygon.coordinates;
  if (rings.length === 0) {
    return { valid: false, message: 'No rings provided' };
  }

  const outerRing = rings[0];
  const vertexCount = outerRing.length;

  if (vertexCount < 4) {
    return { valid: false, message: 'Polygon must have at least 3 distinct points plus closing point' };
  }

  const first = outerRing[0];
  const last = outerRing[vertexCount - 1];
  
  if (first[0] !== last[0] || first[1] !== last[1]) {
    return { valid: false, message: 'Polygon must be closed (first/last points must match)' };
  }

  for (const coord of outerRing) {
    if (!Array.isArray(coord) || coord.length !== 2) {
      return { valid: false, message: 'Invalid coordinate format' };
    }
    
    const [lng, lat] = coord;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return { valid: false, message: 'Coordinates must be numbers' };
    }
    
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return { valid: false, message: 'Invalid coordinate range' };
    }
  }

  return { valid: true, vertexCount };
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, mobile, password, role, region, location } = req.body;

  try {
    // Authority region validation
    if (role === 'authority') {
      if (!region) {
        return next(new ErrorResponse('Region polygon is required for authority registration', 400));
      }

      const validationResult = validatePolygon(region);
      if (!validationResult.valid) {
        return next(new ErrorResponse(`Invalid polygon: ${validationResult.message}`, 400));
      }

      if (validationResult.vertexCount > 100) {
        return next(new ErrorResponse('Polygon too complex (max 100 vertices)', 400));
      }
    }

    // Citizen location validation
    if (role === 'citizen') {
      if (
        !location ||
        location.type !== 'Point' ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        return next(new ErrorResponse('Location (GeoJSON Point) is required for citizen registration', 400));
      }

      const [lng, lat] = location.coordinates;
      if (
        typeof lng !== 'number' || typeof lat !== 'number' ||
        lng < -180 || lng > 180 || lat < -90 || lat > 90
      ) {
        return next(new ErrorResponse('Invalid coordinate values for location', 400));
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      password,
      role,
      ...(role === 'authority' && { assignedRegion: region, isApproved: false }),
      ...(role === 'citizen' && { location, isApproved: true })
    });


    // Create authority request
    if (role === 'authority') {
      await AuthorityRequest.create({
        user: user._id,
        region,
        status: 'pending',
        requestedAt: new Date()
      });

      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Authority Registration',
        `New authority registration request from ${name} (${email})`
      );
    }

    // Send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    await sendEmail(email, 'Verify Your Email', `Your OTP for verification is: ${otp}`);

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
      message: role === 'authority'
        ? 'Registration successful. Please verify email. Your account requires admin approval.'
        : 'Registration successful. Please verify your email.'
    });
  } catch (err) {
    next(err);
  }
};


// [Rest of your existing verifyOTP, login, and getMe methods remain unchanged]

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Private
exports.verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return next(new ErrorResponse('Invalid OTP', 400));
    }

    // Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Delete OTP record
    await OTP.deleteOne({ email, otp });

    // Get user
    const user = await User.findOne({ email }).select('-password');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user is verified
    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify your email first', 401));
    }

    // Check if authority is approved
    if (user.role === 'authority' && !user.isApproved) {
      return next(
        new ErrorResponse('Your account is pending admin approval', 401)
      );
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};
