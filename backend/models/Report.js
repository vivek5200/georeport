const mongoose = require('mongoose');
const geojsonSchema = require('./geojsonSchema'); // For GeoJSON validation

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    enum: ['pothole', 'garbage', 'waterlogging', 'streetlight', 'other'],
    required: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  location: {
    type: geojsonSchema,
    required: true
  },
  photoUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priorityScore: {
    type: Number,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAuthority: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  history: [{
    status: String,
    changedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ assignedAuthority: 1, status: 1 });
// Calculate priority score before saving
ReportSchema.pre('save', function(next) {
  this.priorityScore = this.severity * 2 + this.votes;
  next();
});

module.exports = mongoose.model('Report', ReportSchema);