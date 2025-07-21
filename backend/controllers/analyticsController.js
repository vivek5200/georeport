const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const ErrorResponse = require('../utils/errorResponse');
const redis = require('../config/redis');

// Helper function to calculate distance (Haversine formula)
function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Distance in meters
}

// @desc    Get citizen dashboard data
// @route   GET /api/v1/analytics/citizen
// @access  Private (Citizen)
exports.getCitizenDashboard = asyncHandler(async (req, res, next) => {
  try {
    if (!req.validCoordinates) {
      return next(new ErrorResponse('Valid coordinates are required', 400));
    }

    const coordinates = req.validCoordinates;
    const cacheKey = `dashboard:citizen:${req.user.id}:${coordinates.join(',')}`;

    // Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        fromCache: true,
        data: JSON.parse(cachedData)
      });
    }

    const [myReports, nearbyReports, announcements] = await Promise.all([
      Report.find({ user: req.user.id })
        .select('title status createdAt')
        .sort('-createdAt')
        .limit(5)
        .lean(),

      Report.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates },
            $maxDistance: 500
          }
        },
        status: { $in: ['verified', 'in_progress'] },
        user: { $ne: req.user.id }
      })
        .select('title category status location')
        .limit(10)
        .lean(),

      Announcement.find({
        area: {
          $geoIntersects: {
            $geometry: { type: "Point", coordinates }
          }
        }
      })
        .select('title message createdAt')
        .sort('-createdAt')
        .limit(5)
        .lean()
    ]);

    // Add distance calculations
    const reportsWithDistance = nearbyReports.map(report => ({
      ...report,
      distance: Math.round(calculateDistance(coordinates, report.location.coordinates))
    }));

    const responseData = {
      myReports,
      nearbyReports: reportsWithDistance,
      announcements
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300);

    res.json({
      success: true,
      data: responseData
    });

  } catch (err) {
    next(new ErrorResponse('Failed to load dashboard data', 500));
  }
});

// @desc    Get authority dashboard data
// @route   GET /api/v1/analytics/authority
// @access  Private (Authority)
// @desc    Get authority dashboard data with heatmap
// @route   GET /api/v1/analytics/authority
// @access  Private (Authority)

exports.getAuthorityDashboard = asyncHandler(async (req, res, next) => {
  try {
    const cacheKey = `dashboard:authority:${req.user.id}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return res.json({
        success: true,
        fromCache: true,
        data: JSON.parse(cachedData),
      });
    }

    const [statusCounts, categoryStats, recentReports, heatmapData] = await Promise.all([
      // Status-wise report count
      Report.aggregate([
        { $match: { assignedAuthority: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } }
      ]),

      // Category-wise report stats
      Report.aggregate([
        { $match: { assignedAuthority: req.user._id } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { category: "$_id", count: 1, _id: 0 } }
      ]),

      // Top recent high-priority reports
      Report.find({ assignedAuthority: req.user._id })
        .select('title status priorityScore createdAt')
        .populate('user', 'name')
        .sort('-priorityScore')
        .limit(5)
        .lean(),

      // Heatmap data: locations of ongoing issues
      Report.aggregate([
        {
          $match: {
            assignedAuthority: req.user._id,
            location: { $exists: true, $ne: null },
            status: { $in: ['verified', 'in_progress'] }
          }
        },
        {
          $project: {
            location: "$location.coordinates",
            weight: {
              $cond: [{ $gt: ["$priorityScore", 0] }, "$priorityScore", 1]
            },
            category: 1
          }
        }
      ])
    ]);

    const responseData = {
      stats: {
        statusCounts,
        categoryStats
      },
      recentReports,
      heatmapData
    };

    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 300); // Cache for 5 min

    res.json({
      success: true,
      data: responseData
    });

  } catch (err) {
    console.error('Authority dashboard error:', err);
    next(new ErrorResponse('Failed to load authority dashboard', 500));
  }
});


// @desc    Get admin dashboard data
// @route   GET /api/v1/analytics/admin
// @access  Private (Admin)
exports.getAdminDashboard = asyncHandler(async (req, res, next) => {
  try {
    const cacheKey = 'dashboard:admin';
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return res.json({
        success: true,
        fromCache: true,
        data: JSON.parse(cachedData)
      });
    }

    const [reportStats, heatmapData, authorityPerformance] = await Promise.all([
      // Report statistics
      Report.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            resolutionTime: [
              { $match: { status: "resolved" } },
              { 
                $group: {
                  _id: null,
                  avgHours: { 
                    $avg: {
                      $divide: [
                        { $subtract: ["$updatedAt", "$createdAt"] },
                        1000 * 60 * 60
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      ]),

      // Heatmap data (corrected)
      Report.aggregate([
        { $match: { "location.type": "Point" } },
        {
          $group: {
            _id: null,
            hotspots: {
              $push: {
                location: "$location.coordinates",
                weight: {
                  $cond: [
                    { $gt: ["$priorityScore", 0] },
                    "$priorityScore",
                    1
                  ]
                },
                category: "$category"
              }
            }
          }
        }
      ]),

      // Authority performance
      User.aggregate([
        { $match: { role: "authority" } },
        {
          $lookup: {
            from: "reports",
            localField: "_id",
            foreignField: "assignedAuthority",
            as: "reports"
          }
        },
        {
          $project: {
            name: 1,
            totalReports: { $size: "$reports" },
            resolved: {
              $size: {
                $filter: {
                  input: "$reports",
                  as: "report",
                  cond: { $eq: ["$$report.status", "resolved"] }
                }
              }
            },
            resolutionRate: {
              $avg: {
                $map: {
                  input: {
                    $filter: {
                      input: "$reports",
                      as: "report",
                      cond: { $eq: ["$$report.status", "resolved"] }
                    }
                  },
                  as: "r",
                  in: {
                    $divide: [
                      { $subtract: ["$$r.updatedAt", "$$r.createdAt"] },
                      1000 * 60 * 60
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { resolutionRate: 1 } }
      ])
    ]);

    const responseData = {
      reportStats: {
        total: reportStats[0].total[0]?.count || 0,
        byStatus: reportStats[0].byStatus,
        avgResolutionHours: reportStats[0].resolutionTime[0]?.avgHours || 0
      },
      heatmapData: heatmapData[0]?.hotspots || [],
      authorityPerformance
    };

    await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 600);
    res.json({ success: true, data: responseData });

  } catch (err) {
    console.error('Admin dashboard error:', err);
    next(new ErrorResponse('Dashboard unavailable', 503));
  }
});