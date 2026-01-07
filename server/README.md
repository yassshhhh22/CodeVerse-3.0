# CrowdCrawl Server

<div align="center">

**Backend Services & API**

Enterprise-grade Node.js backend with REST APIs, WebSocket communication, and real-time data processing.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.22.1-000000)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-8.21.0-47A248)](https://www.mongodb.com/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Database Schema](#database-schema)
- [Background Jobs](#background-jobs)
- [Security](#security)
- [Deployment](#deployment)

---

## Overview

The CrowdCrawl Server is a robust Node.js backend application built with Express.js. It handles authentication, real-time WebSocket communication, data processing, alert generation, and provides comprehensive REST APIs for crowd monitoring operations.

### Key Highlights

- **RESTful APIs**: Complete CRUD operations for all resources
- **Real-Time Communication**: WebSocket integration with Socket.IO
- **Data Processing**: Grid density calculations and zone aggregation
- **Alert System**: Intelligent threshold-based alert generation
- **Background Jobs**: Automated data aggregation and health monitoring
- **Enterprise Security**: JWT authentication, role-based access control, rate limiting

---

## Features

### Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Manager, User)
- Secure password hashing with bcrypt
- Token refresh and expiration handling
- Session management

### API Endpoints
- User management (CRUD operations)
- Venue management with grid configuration
- Zone management with grid cell mapping
- Threshold configuration (venue and zone level)
- Real-time grid density data
- Historical analytics and reporting
- Alert management and acknowledgment

### Real-Time Processing
- WebSocket server for bidirectional communication
- Receives metadata from CV module
- Processes and distributes data to connected clients
- Room-based venue subscriptions
- Connection health monitoring

### Data Management
- MongoDB integration with Mongoose ODM
- Real-time density tracking
- Historical data aggregation
- Alert logging and tracking
- User activity logging

### Background Jobs
- Density data aggregation (5-second intervals)
- Camera health monitoring
- Data retention and cleanup
- Automated alert generation
- System health checks

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | >= 18.0.0 | Runtime Environment |
| **Express.js** | 4.22.1 | Web Framework |
| **MongoDB** | 8.21.0 | NoSQL Database |
| **Mongoose** | 8.21.0 | ODM for MongoDB |
| **Socket.IO** | 4.8.3 | WebSocket Server |
| **JWT** | 9.0.3 | Authentication Tokens |
| **Bcrypt** | 2.4.3 | Password Hashing |
| **Winston** | 3.19.0 | Logging Framework |
| **Helmet** | 7.2.0 | Security Headers |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **Express Validator** | 7.3.1 | Input Validation |
| **Express Rate Limit** | 7.5.1 | Rate Limiting |

---

## Project Structure

```
server/
├── config/                      # Configuration files
│   ├── database.js              # MongoDB connection
│   ├── logger.js                # Winston logger setup
│   └── websocket.js             # Socket.IO configuration
│
├── constants/                   # Application constants
│   ├── alertTypes.js            # Alert type definitions
│   ├── userRoles.js             # User role definitions
│   ├── venueStatus.js           # Venue status constants
│   └── thresholdDefaults.js     # Default threshold values
│
├── controllers/                 # Request handlers
│   ├── authController.js        # Authentication logic
│   ├── userController.js        # User management
│   ├── venueController.js       # Venue operations
│   ├── zoneController.js        # Zone management
│   ├── gridController.js        # Grid density data
│   ├── thresholdController.js   # Threshold configuration
│   ├── analyticsController.js   # Analytics and reporting
│   └── alertController.js       # Alert management
│
├── models/                      # Mongoose schemas
│   ├── User.js                  # User schema
│   ├── Venue.js                 # Venue schema
│   ├── Zone.js                  # Zone schema
│   ├── GridDensity.js           # Real-time grid data
│   ├── DensityLog.js            # Historical density logs
│   ├── Alert.js                 # Alert schema
│   └── Threshold.js             # Threshold configuration
│
├── routes/                      # API route definitions
│   ├── authRoutes.js            # Authentication routes
│   ├── userRoutes.js            # User routes
│   ├── venueRoutes.js           # Venue routes
│   ├── zoneRoutes.js            # Zone routes
│   ├── gridRoutes.js            # Grid data routes
│   ├── thresholdRoutes.js       # Threshold routes
│   ├── analyticsRoutes.js       # Analytics routes
│   └── alertRoutes.js           # Alert routes
│
├── middleware/                  # Express middleware
│   ├── authMiddleware.js        # JWT authentication
│   ├── roleMiddleware.js        # Role-based access
│   ├── errorMiddleware.js       # Error handling
│   ├── validationMiddleware.js  # Input validation
│   └── requestLogger.js         # Request logging
│
├── services/                    # Business logic services
│   ├── gridDensityService.js    # Grid density calculations
│   ├── zoneGridService.js       # Zone mapping logic
│   ├── alertService.js          # Alert generation
│   ├── thresholdService.js      # Threshold evaluation
│   ├── densityAggregationService.js  # Data aggregation
│   └── cameraHealthService.js   # Health monitoring
│
├── websockets/                  # WebSocket handlers
│   ├── cvMetadataHandler.js     # CV module data receiver
│   └── clientSocketHandler.js   # Client communication
│
├── jobs/                        # Background jobs
│   ├── densityAggregatorJob.js  # Density aggregation job
│   └── cameraHealthCheckJob.js  # Health check job
│
├── utils/                       # Utility functions
│   ├── asyncHandler.js          # Async error wrapper
│   ├── errorResponse.js         # Error response formatter
│   └── validators.js            # Custom validators
│
├── uploads/                     # File uploads directory
├── logs/                        # Application logs
├── app.js                       # Express app configuration
├── server.js                    # Server entry point
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## Installation

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **MongoDB**: >= 6.0 (local or MongoDB Atlas)

### Step 1: Install Dependencies

```bash
# Navigate to server directory
cd server

# Install all dependencies
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the server directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crowdcrawl

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# WebSocket Configuration
WS_PORT=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Security
BCRYPT_ROUNDS=10
```

### Step 3: Start Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `CLIENT_URL` | Frontend URL for CORS | - | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT | - | Yes |
| `JWT_EXPIRE` | Token expiration time | `7d` | Yes |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Database Connection

The server automatically connects to MongoDB on startup:

```javascript
// config/database.js
import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

---

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Venue Endpoints

#### Get All Venues
```http
GET /api/venues
Authorization: Bearer <token>
```

#### Create Venue (Admin Only)
```http
POST /api/venues
Authorization: Bearer <token>
Content-Type: application/json

{
  "camera_id": "CAM_01",
  "name": "Central Station Entrance",
  "frame_width": 1280,
  "frame_height": 720,
  "grid_rows": 10,
  "grid_cols": 10
}
```

#### Update Venue (Admin Only)
```http
PUT /api/venues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Venue Name",
  "grid_rows": 12,
  "grid_cols": 12
}
```

### Zone Endpoints

#### Get Venue Zones
```http
GET /api/venues/:venueId/zones
Authorization: Bearer <token>
```

#### Create Zone (Admin Only)
```http
POST /api/venues/:venueId/zones
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entrance Zone",
  "grid_cells": {
    "start": { "x": 0, "y": 0 },
    "end": { "x": 3, "y": 5 }
  }
}
```

### Grid Data Endpoints

#### Get Latest Grid Data
```http
GET /api/venues/:venueId/grid/latest
Authorization: Bearer <token>
```

#### Get Historical Grid Data
```http
GET /api/venues/:venueId/grid/history?startDate=2026-01-01&endDate=2026-01-07
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Hourly Analytics
```http
GET /api/venues/:venueId/analytics/hourly?date=2026-01-07
Authorization: Bearer <token>
```

#### Get Daily Analytics
```http
GET /api/venues/:venueId/analytics/daily?startDate=2026-01-01&endDate=2026-01-07
Authorization: Bearer <token>
```

#### Get Peak Density Analysis
```http
GET /api/venues/:venueId/analytics/peaks?period=week
Authorization: Bearer <token>
```

### Alert Endpoints

#### Get All Alerts
```http
GET /api/alerts?status=active&severity=critical
Authorization: Bearer <token>
```

#### Acknowledge Alert
```http
PUT /api/alerts/:alertId/acknowledge
Authorization: Bearer <token>
```

For complete API documentation with examples, see [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md).

---

## WebSocket Events

### Client to Server Events

#### Join Venue
```javascript
socket.emit('join_venue', venueId);
```

#### Leave Venue
```javascript
socket.emit('leave_venue', venueId);
```

### Server to Client Events

#### Grid Update
```javascript
socket.on('grid_update', (data) => {
  // data: { venueId, gridData, timestamp, totalDensity }
});
```

#### Alert Triggered
```javascript
socket.on('alert_triggered', (alert) => {
  // alert: { type, severity, message, venueId, zoneId, timestamp }
});
```

#### Connection Status
```javascript
socket.on('connection_status', (status) => {
  // status: { connected, lastUpdate, systemHealth }
});
```

### CV Module to Server Events

#### Camera Data
```javascript
// Received from Python CV module
socket.on('camera_data', async (metadata) => {
  // metadata: { camera_id, detections, timestamp, detection_count }
});
```

---

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin', 'manager']),
  createdAt: Date,
  updatedAt: Date
}
```

### Venue Schema
```javascript
{
  camera_id: String (unique),
  name: String,
  frame_width: Number,
  frame_height: Number,
  grid_rows: Number,
  grid_cols: Number,
  status: String (enum: ['active', 'inactive']),
  last_metadata_time: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Zone Schema
```javascript
{
  venue_id: ObjectId (ref: 'Venue'),
  name: String,
  grid_cells: {
    start: { x: Number, y: Number },
    end: { x: Number, y: Number }
  },
  threshold: {
    warning_level: Number,
    critical_level: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### GridDensity Schema
```javascript
{
  venue_id: ObjectId (ref: 'Venue'),
  grid_matrix: [[Number]],
  zone_density: Map,
  total_density: Number,
  timestamp: Date,
  metadata: Object
}
```

### Alert Schema
```javascript
{
  venue_id: ObjectId (ref: 'Venue'),
  zone_id: ObjectId (ref: 'Zone'),
  type: String (enum: ['venue_warning', 'venue_critical', 'zone_warning', 'zone_critical']),
  severity: String (enum: ['warning', 'critical']),
  density_value: Number,
  threshold_value: Number,
  message: String,
  acknowledged: Boolean,
  acknowledged_by: ObjectId (ref: 'User'),
  acknowledged_at: Date,
  createdAt: Date
}
```

---

## Background Jobs

### Density Aggregator Job

Runs every 5 seconds to aggregate real-time density data:

```javascript
// jobs/densityAggregatorJob.js
cron.schedule('*/5 * * * * *', async () => {
  // Aggregate recent grid density data
  // Calculate hourly averages
  // Store in DensityLog collection
});
```

### Camera Health Check Job

Runs every minute to monitor camera connectivity:

```javascript
// jobs/cameraHealthCheckJob.js
cron.schedule('* * * * *', async () => {
  // Check last_metadata_time for each venue
  // Mark venues as inactive if no data received
  // Generate health alerts if necessary
});
```

---

## Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with 10 salt rounds
- **Role-Based Access**: Granular permissions based on user roles
- **Token Expiration**: Configurable expiration (default: 7 days)

### Input Validation

- **Express Validator**: Comprehensive input validation
- **MongoDB Sanitization**: Prevention of NoSQL injection
- **XSS Protection**: Input sanitization for cross-site scripting
- **HPP Protection**: HTTP parameter pollution prevention

### Security Headers

- **Helmet.js**: Security headers middleware
- **CORS**: Configured cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Cookie Security**: HTTP-only, secure cookies

### Best Practices

- Environment variables for sensitive data
- Encrypted database connections
- Secure WebSocket connections
- Request logging and monitoring
- Error handling without exposing internals

---

## Deployment

### Production Setup

```bash
# Install dependencies
npm install --production

# Set environment to production
export NODE_ENV=production

# Start server
npm start
```

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name crowdcrawl-server

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t crowdcrawl-server .
docker run -p 5000:5000 --env-file .env crowdcrawl-server
```

### Environment-Specific Configuration

```bash
# Development
NODE_ENV=development npm run dev

# Staging
NODE_ENV=staging npm start

# Production
NODE_ENV=production npm start
```

---

<div align="center">

**Enterprise-grade backend for crowd monitoring**

[Back to Main README](../README.md)

</div>
