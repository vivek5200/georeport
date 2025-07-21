const mongoose = require('mongoose');

const AuthorityRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  region: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuthorityRequest', AuthorityRequestSchema);