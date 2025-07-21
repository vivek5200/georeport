const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  mobile: {
    type: String,
    required: [true, 'Please add a mobile number'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'authority', 'admin'],
    default: 'citizen',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: function () {
      return this.role === 'citizen';
    },
  },
  assignedRegion: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: function () {
        return this.role === 'authority';
      },
    },
    coordinates: {
      type: [[[Number]]],
      required: function () {
        return this.role === 'authority';
      },
    },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      index: '2dsphere',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, role: this.role, isApproved: this.isApproved },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
