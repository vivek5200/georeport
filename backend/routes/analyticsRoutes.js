const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validateCoordinates = require('../middleware/validateCoordinates');
// Delayed controller import to break potential circular dependencies
let getCitizenDashboard, getAuthorityDashboard, getAdminDashboard;

// Dynamic import with error handling
try {
  const analyticsController = require('../controllers/analyticsController');
  getCitizenDashboard = analyticsController.getCitizenDashboard;
  getAuthorityDashboard = analyticsController.getAuthorityDashboard;
  getAdminDashboard = analyticsController.getAdminDashboard;
  
  console.log('Controller functions loaded:', {
    citizen: typeof getCitizenDashboard,
    authority: typeof getAuthorityDashboard,
    admin: typeof getAdminDashboard
  });
} catch (err) {
  console.error('Controller import failed:', err);
  process.exit(1);
}

// Verify functions exist before route definitions
if (!getCitizenDashboard || !getAuthorityDashboard || !getAdminDashboard) {
  throw new Error('One or more controller functions are undefined');
}

// Routes with explicit function checks
router.get('/citizen', 
  protect,
  authorize('citizen'),
  validateCoordinates, // ✅ Middleware to parse & validate query coordinates
  (req, res, next) => {
    if (typeof getCitizenDashboard !== 'function') {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    getCitizenDashboard(req, res, next);
  }
);

router.get('/authority',
  protect,
  authorize('authority'),
  (req, res, next) => {
    getAuthorityDashboard(req, res, next);
  }
);

router.get('/admin',
  protect,
  authorize('admin'),
  (req, res, next) => {
    getAdminDashboard(req, res, next);
  }
);

module.exports = router;