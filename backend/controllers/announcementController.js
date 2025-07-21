const Announcement = require('../models/Announcement');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create announcement (admin/global or authority/regional)
// @route   POST /api/v1/announcements
// @access  Private (Admin/Authority)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, area } = req.body;
    const { id, role, assignedRegion } = req.user;

    // Validate title and message
    if (!title || !message) {
      return next(new ErrorResponse('Title and message are required', 400));
    }

    // Authority must provide area; admin doesn't need to
    let announcementArea;
    if (role === 'authority') {
      if (!area || !area.coordinates || !area.type) {
        return next(new ErrorResponse('Valid area (GeoJSON Polygon) is required for authority announcements', 400));
      }
      announcementArea = area;
    } else if (role === 'admin') {
      // Use full-earth polygon as default or skip area if you want
      announcementArea = {
        type: 'Polygon',
        coordinates: [[[0, 0], [180, 0], [180, 90], [0, 0], [0, 0]]]
      };
    } else {
      return next(new ErrorResponse('Only admin or authority can create announcements', 403));
    }

    // Create and save the announcement
    const announcement = await Announcement.create({
      title,
      message,
      authority: id,
      area: announcementArea
    });

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (err) {
    console.error(err);
    next(new ErrorResponse('Server error while creating announcement', 500));
  }
};

// @desc    Get announcements visible to current user
// @route   GET /api/v1/announcements
// @access  Private
// @desc    Get announcements visible to current user
exports.getAnnouncements = async (req, res, next) => {
  const user = req.user;

  try {
    let announcements;

    if (user.role === 'admin') {
      announcements = await Announcement.find().sort({ createdAt: -1 });

    } else if (user.role === 'authority') {
      announcements = await Announcement.find({
        $or: [
          { authority: user._id },
          { 'area.coordinates': [[[0, 0], [180, 0], [180, 90], [0, 0]]] } // global marker (example)
        ]
      }).sort({ createdAt: -1 });

    } else {
      // 🛑 Fix starts here
      if (!user.location || !user.location.coordinates) {
        return res.status(400).json({
          success: false,
          message: 'User location is not set. Cannot filter announcements by area.'
        });
      }

      announcements = await Announcement.find({
        area: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: user.location.coordinates
            }
          }
        }
      }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Get announcement by ID
