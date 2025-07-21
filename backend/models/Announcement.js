const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  authority: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  area: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
AnnouncementSchema.index({ area: '2dsphere' });
module.exports = mongoose.model('Announcement', AnnouncementSchema);