const express = require('express');
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  voteReport,
  getReportsHeatmap
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();  
// In reportRoutes.js, add this debug code before routes:
console.log('Controller functions:');
console.log('createReport:', typeof createReport);
console.log('getReports:', typeof getReports);
console.log('getReport:', typeof getReport);
console.log('updateReportStatus:', typeof updateReportStatus);
console.log('voteReport:', typeof voteReport);
console.log('getReportsHeatmap:', typeof getReportsHeatmap);


router.post('/', protect, createReport);
router.get('/', protect, getReports);
console.log('typeof getReportsHeatmap:', typeof getReportsHeatmap);
console.log('typeof authorize:', typeof authorize);
router.get('/heatmap', protect, authorize('admin'), getReportsHeatmap);
router.get('/:id', protect, getReport);
router.patch('/:id/status', protect, authorize('authority', 'admin'), updateReportStatus);
router.post('/:id/vote', protect, voteReport);

module.exports = router;
