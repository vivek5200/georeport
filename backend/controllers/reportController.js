const Report = require('../models/Report');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../config/mailer');
const geospatial = require('../utils/geospatial');

/**
 * @desc    Create new report
 * @route   POST /api/v1/reports
 * @access  Private
 */
const createReport = async (req, res, next) => {
  const { location, category } = req.body;
  
  try {
    // Check for duplicate reports nearby
    const duplicateReport = await geospatial.findNearbyDuplicateReports(
      location.coordinates, 
      category
    );

    if (duplicateReport) {
      return res.status(400).json({
        success: false,
        message: 'Similar report already exists nearby'
      });
    }

    const reportData = {
      ...req.body,
      user: req.user.id,
      status: 'pending'
    };

    const report = await Report.create(reportData);
    await assignReportToAuthority(report);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports with filters
 * @route   GET /api/v1/reports
 * @access  Private
 */
const getReports = async (req, res, next) => {
  try {
    const query = buildReportQuery(req);
    const reports = await Report.find(query)
      .populate('user', 'name email')
      .populate('assignedAuthority', 'name email');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report
 * @route   GET /api/v1/reports/:id
 * @access  Private
 */
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedAuthority', 'name email');

    if (!report) {
      return next(new ErrorResponse('Report not found', 404));
    }

    authorizeReportAccess(req.user, report);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status
 * @route   PUT /api/v1/reports/:id/status
 * @access  Private (Authority/Admin)
 */
const updateReportStatus = async (req, res, next) => {
  const { status, note } = req.body;
  
  try {
    // Validate status transition
    const validTransitions = {
      pending: ['verified', 'rejected'],
      verified: ['in_progress', 'rejected'],
      in_progress: ['resolved'],
      rejected: [],
      resolved: []
    };

    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedAuthority', 'name email');

    if (!report) {
      return next(new ErrorResponse('Report not found', 404));
    }

    // Check if status transition is allowed
    if (!validTransitions[report.status].includes(status)) {
      return next(new ErrorResponse(`Invalid status transition from ${report.status} to ${status}`, 400));
    }

    // Update report
    report.history.push({
      status,
      changedBy: req.user.id,
      note: note || ''
    });

    report.status = status;
    await report.save();

    // ===== REAL-TIME UPDATES =====
    const io = req.app.get('io');
    
    // 1. Notify report owner (citizen)
    if (report.user) {
      io.to(`user_${report.user._id}`).emit('reportStatusChanged', {
        reportId: report._id,
        newStatus: status,
        updatedAt: new Date()
      });
    }

    // 2. Notify authority team
    if (report.assignedAuthority) {
      io.to(`authority_${report.assignedAuthority._id}`).emit('workUpdate', {
        reportId: report._id,
        newStatus: status,
        priority: report.priorityScore
      });
    }

    // 3. Notify admin dashboard
    io.to('admin_dashboard').emit('reportUpdated', {
      reportId: report._id,
      category: report.category,
      newStatus: status,
      location: report.location
    });

    // ===== EMAIL NOTIFICATIONS =====
    if (status === 'in_progress' && report.user?.email) {
      await sendEmail(
        report.user.email,
        'Your Report is Being Worked On',
        `Your report "${report.title}" is now in progress.`
      );
    }

    if (status === 'resolved' && report.user?.email) {
      await sendEmail(
        report.user.email,
        'Report Resolved',
        `Your report "${report.title}" has been marked as resolved.`
      );
    }

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Vote on a report
 * @route   POST /api/v1/reports/:id/vote
 * @access  Private
 */
const voteReport = async (req, res, next) => {
  const { value } = req.body;
  
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return next(new ErrorResponse('Report not found', 404));

    handleVoteSubmission(report, req.user.id, value);
    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get heatmap data
 * @route   GET /api/v1/reports/heatmap
 * @access  Private (Admin)
 */
const getReportsHeatmap = async (req, res, next) => {
  try {
    const heatmapData = await Report.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          locations: { $push: "$location.coordinates" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    next(error);
  }
};

// Helper Functions
const assignReportToAuthority = async (report) => {
  const authority = await User.findOne({
    role: 'authority',
    assignedRegion: {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: report.location.coordinates
        }
      }
    }
  });

  if (authority) {
    report.assignedAuthority = authority._id;
    await report.save();
    await sendEmail(
      authority.email, 
      'New Report Assignment', 
      `New report assigned to you: ${report.title}`
    );
  }
};

const buildReportQuery = (req) => {
  let query = {};
  
  // Role-based filtering
  if (req.user.role === 'citizen') {
    query = {
      $or: [
        { user: req.user.id },
        { status: { $in: ['verified', 'in_progress'] } }
      ]
    };
  } else if (req.user.role === 'authority') {
    query = { assignedAuthority: req.user.id };
  }

  // Location filtering
  if (req.query.lat && req.query.lng) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
        },
        $maxDistance: 5000 // 5km radius
      }
    };
  }

  return query;
};

const authorizeReportAccess = (user, report) => {
  if (user.role === 'citizen' && report.user._id.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to access this report', 403);
  }
};

const handleVoteSubmission = (report, userId, value) => {
  const existingVoteIndex = report.votes.findIndex(
    v => v.user.toString() === userId
  );

  if (existingVoteIndex >= 0) {
    report.votes[existingVoteIndex].value = value;
  } else {
    report.votes.push({ user: userId, value });
  }

  report.verificationScore = report.votes.reduce(
    (sum, vote) => sum + vote.value, 0
  );
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  voteReport,
  getReportsHeatmap
};