const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Add this array definition
const allowedOrigins = [
  'https://geo-report.netlify.app',
  // 'https://georeport-frontend-795753085043.asia-south1.run.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug: Verify controller functions exist
const verifyControllers = () => {
  try {
    const analyticsController = require('./controllers/analyticsController');
    console.log('Controller functions verified:', {
      getCitizenDashboard: typeof analyticsController.getCitizenDashboard,
      getAuthorityDashboard: typeof analyticsController.getAuthorityDashboard,
      getAdminDashboard: typeof analyticsController.getAdminDashboard
    });
    return true;
  } catch (err) {
    console.error('Controller verification failed:', err);
    return false;
  }
};

if (!verifyControllers()) {
  process.exit(1);
}

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/announcements', require('./routes/announcementRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ✅ Socket.IO setup with proper CORS
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('subscribeToReport', (reportId) => {
    socket.join(reportId);
    console.log(`Client ${socket.id} subscribed to report ${reportId}`);
  });

  socket.on('subscribeToAuthority', (authorityId) => {
    socket.join(`authority_${authorityId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// Shutdown handling
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
