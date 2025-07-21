const User = require('../models/User');
const AuthorityRequest = require('../models/AuthorityRequest');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all pending authority requests
// @route   GET /api/v1/admin/requests
// @access  Private/Admin
exports.getAuthorityRequests = async (req, res, next) => {
  try {
    const requests = await AuthorityRequest.find({ status: 'pending' })
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject an authority request
// @route   PUT /api/v1/admin/requests/:id
// @access  Private/Admin
exports.updateAuthorityRequest = async (req, res, next) => {
  try {
    const request = await AuthorityRequest.findById(req.params.id).populate('user');

    if (!request) {
      return next(new ErrorResponse('Request not found', 404));
    }

    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status value', 400));
    }

    request.status = status;
    await request.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(request.user._id, {
        isApproved: true,
        assignedRegion: request.region,
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analytics for admin dashboard
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const approvedAuthorities = await User.countDocuments({ role: 'authority', isApproved: true });
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Report stats
    const totalReports = await Report.countDocuments();
    const reportStatusCounts = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Avg resolution time (in hours)
    const resolvedReports = await Report.find({ status: 'resolved' });
    let totalResolutionTime = 0;

    resolvedReports.forEach(report => {
      if (report.createdAt && report.resolvedAt) {
        totalResolutionTime += (report.resolvedAt - report.createdAt);
      }
    });

    const avgResolutionHours = resolvedReports.length
      ? totalResolutionTime / resolvedReports.length / (1000 * 60 * 60)
      : 0;

    // Announcement stats
    const totalAnnouncements = await Announcement.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          verified: verifiedUsers,
          approvedAuthorities,
          byRole: userRoles,
        },
        reportStats: {
          total: totalReports,
          byStatus: reportStatusCounts,
          avgResolutionHours: avgResolutionHours.toFixed(2),
        },
        announcementStats: {
          total: totalAnnouncements,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.getReportsHeatmap = async (req, res, next) => {
  try {
    const { status, category, lastDays } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (lastDays) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(lastDays));
      query.createdAt = { $gte: date };
    }

    const result = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          locations: { $push: '$location.coordinates' }
        }
      }
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

