# GeoReport 🏙️

**Real-Time Civic Issue Reporting & Tracking Platform**

GeoReport is a full-stack MERN application designed to bridge the gap between citizens and local authorities. It allows users to report civic issues (like potholes, garbage, or streetlights) with precise geolocation, tracks the status in real-time, and automatically assigns issues to the correct authorities using geospatial fencing.

---

## 🚀 Key Features

### 📍 Geospatial Reporting
Users can pin exact locations on a map to report issues. The system checks for duplicate reports within a 5km radius to prevent spam.

### ⚡ Real-Time Updates
Built with **Socket.io**, the platform pushes instant status updates (Pending → In Progress → Resolved) to citizens and authorities without page refreshes.

### 🤖 Smart Authority Assignment
Uses MongoDB geospatial queries (`$geoIntersects`) to automatically route reports to the specific authority responsible for that region.

### 🗺️ Interactive Maps
Integrated **OpenLayers** for visualization, including heatmaps of high-issue zones.

### 🔐 Role-Based Access
Distinct dashboards for **Citizens** (report & track), **Authorities** (manage & resolve), and **Admins** (analytics & oversight).

### 📧 Automated Notifications
Email alerts via Nodemailer for report submission and status changes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Maps**: OpenLayers (`ol`)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose)
- **Caching**: Redis (via `ioredis`)
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer

### DevOps
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git

---

## ⚙️ Installation & Setup

You can run the project using Docker (recommended) or manually.

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/georeport.git
   cd georeport
   ```

2. **Create `.env` file**
   
   Copy the example env file in the `backend` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and fill in your credentials (see Environment Variables section below).

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   
   This will start:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - MongoDB & Redis (automatically configured)

4. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or cloud instance)
- Redis server (running locally or cloud instance)
- npm or yarn

#### Backend Setup

1. **Navigate to the backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory (see Environment Variables section below).

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

   The backend API will run on `http://localhost:5000`

#### Frontend Setup

1. **Navigate to the frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   
   Update the API base URL in your frontend configuration to point to your backend.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

---

## 📂 Project Structure

```
georeport/
├── backend/                # Node.js/Express API
│   ├── config/            # DB, Redis, Mailer configurations
│   ├── controllers/       # Request logic (Reports, Auth, Admin)
│   ├── middleware/        # Auth & Validation middleware
│   ├── models/            # Mongoose Schemas (GeoJSON support)
│   │   ├── User.js        # User model with role-based access
│   │   ├── Report.js      # Report model with geospatial data
│   │   └── Authority.js   # Authority model with jurisdiction zones
│   ├── routes/            # API Routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── reports.js     # Report CRUD operations
│   │   ├── admin.js       # Admin analytics & management
│   │   └── authority.js   # Authority management routes
│   ├── utils/             # Helper functions
│   ├── server.js          # Entry point & Socket.io setup
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/               # React + Vite Client
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Map/       # Map-related components
│   │   │   ├── Dashboard/ # Dashboard components
│   │   │   └── Common/    # Shared UI elements
│   │   ├── contexts/      # Auth & Socket contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/         # Dashboard & Reporting pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── CitizenDashboard.jsx
│   │   │   ├── AuthorityDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── utils/         # Frontend utilities
│   │   ├── main.jsx       # App entry point
│   │   └── App.jsx        # Root component
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml      # Container orchestration
├── .gitignore
└── README.md              # This file
```

---

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/georeport
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/georeport

# Authentication
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Redis Cache
REDIS_URL=redis://localhost:6379
# For cloud Redis:
# REDIS_URL=redis://username:password@host:port

# Email Configuration (for Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
# For Gmail: Enable 2FA and generate App Password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Socket.io Configuration (optional)
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Important Notes:
- **Never commit the `.env` file** to version control
- For Gmail: Use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password
- Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 🔐 User Roles & Permissions

### Citizen
- Create and submit civic issue reports
- Track status of their reports
- View report history
- Receive notifications on status updates

### Authority
- View reports assigned to their jurisdiction
- Update report status (Pending → In Progress → Resolved)
- Add comments and updates to reports
- View analytics for their area

### Admin
- Oversee all reports across all authorities
- Manage user accounts and authorities
- View system-wide analytics and heatmaps
- Configure geospatial boundaries for authorities

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       # User registration
POST   /api/auth/login          # User login
GET    /api/auth/profile        # Get current user profile
PUT    /api/auth/profile        # Update profile
```

### Reports
```
GET    /api/reports             # Get all reports (filtered by role)
POST   /api/reports             # Create new report
GET    /api/reports/:id         # Get single report
PUT    /api/reports/:id         # Update report status
DELETE /api/reports/:id         # Delete report (admin only)
GET    /api/reports/nearby      # Find reports within radius
```

### Admin
```
GET    /api/admin/analytics     # Get system analytics
GET    /api/admin/users         # Manage users
GET    /api/admin/heatmap       # Get issue heatmap data
```

### Authority
```
GET    /api/authority/zone      # Get authority jurisdiction
PUT    /api/authority/reports/:id  # Update assigned report
```

---

## 🌐 WebSocket Events

### Client → Server
```javascript
socket.emit('join-room', userId);           // Join user-specific room
socket.emit('report-update', reportData);   // Emit report updates
```

### Server → Client
```javascript
socket.on('report-created', (report) => {});      // New report created
socket.on('report-updated', (report) => {});      // Report status changed
socket.on('notification', (notification) => {});  // General notifications
```

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 🚀 Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build  # if TypeScript
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, or Railway
- **Database**: MongoDB Atlas
- **Redis**: Redis Cloud or AWS ElastiCache

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Report attachments limited to 5MB
- Duplicate detection radius is fixed at 5km

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] Report upvoting system
- [ ] Image recognition for issue categorization

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Your Name** - *Full Stack Developer*
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- OpenLayers for mapping capabilities
- MongoDB for geospatial queries
- Socket.io for real-time functionality
- The open-source community

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue in the [GitHub Issue Tracker](https://github.com/yourusername/georeport/issues)
- Contact: your.email@example.com

---

**Making cities better, one report at a time! 🏙️✨**
