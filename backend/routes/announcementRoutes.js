const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, authorize('admin', 'authority'), createAnnouncement)
  .get(protect, getAnnouncements);

module.exports = router;
