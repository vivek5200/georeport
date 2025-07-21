const express = require('express');
const {
  getAuthorityRequests,
  updateAuthorityRequest,
  getAdminAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { getReportsHeatmap } = require('../controllers/reportController'); 
const router = express.Router();

// Protect all admin routes and restrict to admin role only
router.use(protect);
router.use(authorize('admin'));

// Admin routes
router.get('/requests', getAuthorityRequests);               // Pending authority requests
router.put('/requests/:id', updateAuthorityRequest);         // Approve/reject request
router.get('/analytics', getAdminAnalytics);                 // Admin dashboard analytics
router.get('/heatmap', getReportsHeatmap);
module.exports = router;
