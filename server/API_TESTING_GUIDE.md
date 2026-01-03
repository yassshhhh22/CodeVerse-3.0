# API Testing Guide - Crowd Monitoring System

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User
**POST** `/api/auth/register`

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://via.placeholder.com/150"
  }
}
```

**Test Cases**:
- Valid registration
- Duplicate email (409 Conflict)
- Invalid email format (400 Bad Request)
- Password less than 6 characters (400 Bad Request)

---

### 1.2 Login User
**POST** `/api/auth/login`

**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Test Cases**:
- Valid credentials
- Invalid email (401 Unauthorized)
- Invalid password (401 Unauthorized)
- Missing fields (400 Bad Request)

---

### 1.3 Get Current User
**GET** `/api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://via.placeholder.com/150",
    "createdAt": "2026-01-03T10:00:00.000Z"
  }
}
```

**Test Cases**:
- Valid token
- Invalid token (401 Unauthorized)
- Expired token (401 Unauthorized)
- No token (401 Unauthorized)

---

### 1.4 Logout
**POST** `/api/auth/logout`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 1.5 Update User Details
**PUT** `/api/auth/updatedetails`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "name": "John Smith",
  "bio": "Software Developer"
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john@example.com",
    "bio": "Software Developer"
  }
}
```

---

### 1.6 Update Password
**PUT** `/api/auth/updatepassword`

**Headers**: `Authorization: Bearer <token>`

**Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Password updated successfully",
  "token": "new_jwt_token..."
}
```

---

## 2. VENUE ENDPOINTS (Admin Only for CUD)

### 2.1 Create Venue
**POST** `/api/venues`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "camera_id": "CAM_01",
  "name": "Central Station Entrance",
  "frame_width": 1280,
  "frame_height": 720,
  "grid_rows": 10,
  "grid_cols": 10
}
```

**Response** (201):
```json
{
  "status": "success",
  "data": {
    "_id": "venue_id_here",
    "camera_id": "CAM_01",
    "name": "Central Station Entrance",
    "frame_width": 1280,
    "frame_height": 720,
    "grid_rows": 10,
    "grid_cols": 10,
    "status": "active",
    "created_by": "user_id"
  },
  "message": "Venue created successfully"
}
```

**Test Cases**:
- Admin creates venue (201)
- Non-admin tries to create (403 Forbidden)
- Duplicate camera_id (409 Conflict)
- Invalid grid dimensions (400 Bad Request)

---

### 2.2 Get All Venues
**GET** `/api/venues`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "venue_id",
      "camera_id": "CAM_01",
      "name": "Central Station",
      "status": "active",
      "created_by": {
        "_id": "user_id",
        "name": "Admin User"
      }
    }
  ]
}
```

---

### 2.3 Get Venue by ID
**GET** `/api/venues/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "venue_id",
    "camera_id": "CAM_01",
    "name": "Central Station",
    "frame_width": 1280,
    "frame_height": 720,
    "grid_rows": 10,
    "grid_cols": 10,
    "status": "active"
  }
}
```

**Test Cases**:
- Valid venue ID
- Invalid venue ID (404 Not Found)
- Invalid ObjectId format (400 Bad Request)

---

### 2.4 Update Venue
**PUT** `/api/venues/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "Updated Venue Name",
  "status": "inactive"
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "venue_id",
    "name": "Updated Venue Name",
    "status": "inactive"
  },
  "message": "Venue updated successfully"
}
```

---

### 2.5 Delete Venue
**DELETE** `/api/venues/:id`

**Headers**: `Authorization: Bearer <admin_token>`

**Response** (200):
```json
{
  "status": "success",
  "message": "Venue deleted successfully"
}
```

---

## 3. ZONE ENDPOINTS

### 3.1 Create Zone
**POST** `/api/venues/:id/zones`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "Entrance Zone",
  "grid_cells": {
    "start": { "x": 0, "y": 0 },
    "end": { "x": 3, "y": 5 }
  }
}
```

**Response** (201):
```json
{
  "status": "success",
  "data": {
    "_id": "zone_id",
    "venue_id": "venue_id",
    "name": "Entrance Zone",
    "grid_cells": {
      "start": { "x": 0, "y": 0 },
      "end": { "x": 3, "y": 5 }
    }
  },
  "message": "Zone created successfully"
}
```

**Test Cases**:
- Valid zone creation
- Invalid grid cells (start > end) (400 Bad Request)
- Non-admin tries to create (403 Forbidden)

---

### 3.2 Get Zones by Venue
**GET** `/api/venues/:id/zones`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": [
    {
      "_id": "zone_id",
      "name": "Entrance Zone",
      "grid_cells": {
        "start": { "x": 0, "y": 0 },
        "end": { "x": 3, "y": 5 }
      }
    }
  ]
}
```

---

### 3.3 Get Zone by ID
**GET** `/api/venues/:id/zones/:zoneId`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "zone_id",
    "name": "Entrance Zone",
    "grid_cells": {
      "start": { "x": 0, "y": 0 },
      "end": { "x": 3, "y": 5 }
    }
  }
}
```

---

### 3.4 Update Zone
**PUT** `/api/venues/:id/zones/:zoneId`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "Main Entrance",
  "grid_cells": {
    "start": { "x": 0, "y": 0 },
    "end": { "x": 4, "y": 6 }
  }
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "zone_id",
    "name": "Main Entrance",
    "grid_cells": {
      "start": { "x": 0, "y": 0 },
      "end": { "x": 4, "y": 6 }
    }
  }
}
```

---

### 3.5 Delete Zone
**DELETE** `/api/venues/:id/zones/:zoneId`

**Headers**: `Authorization: Bearer <admin_token>`

**Response** (200):
```json
{
  "status": "success",
  "message": "Zone deleted successfully"
}
```

---

## 4. THRESHOLD ENDPOINTS

### 4.1 Set Venue Threshold
**PUT** `/api/venues/:id/thresholds/venue`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "warning_level": 25,
  "critical_level": 40
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "threshold_id",
    "venue_id": "venue_id",
    "warning_level": 25,
    "critical_level": 40
  },
  "message": "Venue threshold set successfully"
}
```

**Test Cases**:
- Valid thresholds (warning < critical)
- Invalid thresholds (warning >= critical) (400 Bad Request)
- Negative values (400 Bad Request)

---

### 4.2 Set Zone Threshold
**PUT** `/api/venues/:id/thresholds/zone/:zoneId`

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "warning_level": 8,
  "critical_level": 12
}
```

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "threshold_id",
    "venue_id": "venue_id",
    "zone_id": "zone_id",
    "warning_level": 8,
    "critical_level": 12
  },
  "message": "Zone threshold set successfully"
}
```

---

### 4.3 Get Venue Thresholds
**GET** `/api/venues/:id/thresholds/venue`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "warning_level": 25,
    "critical_level": 40
  }
}
```

---

### 4.4 Get Zone Threshold
**GET** `/api/venues/:id/thresholds/zone/:zoneId`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "warning_level": 8,
    "critical_level": 12
  }
}
```

---

## 5. GRID DENSITY ENDPOINTS

### 5.1 Get Current Grid Density
**GET** `/api/venues/:id/grid/density`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "venue_id": "venue_id",
    "matrix": [
      [0, 1, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    "timestamp": "2026-01-03T17:33:18.584Z"
  }
}
```

**Test Cases**:
- Venue with recent data
- Venue with no recent data (404 Not Found)
- Invalid venue ID (404 Not Found)

---

### 5.2 Get Zone Densities
**GET** `/api/venues/:id/grid/zone-densities`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "zones": [
      {
        "zone_id": "zone_id",
        "zone_name": "Entrance",
        "count": 5
      },
      {
        "zone_id": "zone_id_2",
        "zone_name": "Main Floor",
        "count": 12
      }
    ],
    "timestamp": "2026-01-03T17:33:18.584Z"
  }
}
```

---

## 6. ALERT ENDPOINTS

### 6.1 Get All Alerts
**GET** `/api/alerts`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `venue_id` (optional): Filter by venue
- `zone_id` (optional): Filter by zone
- `severity` (optional): "warning" or "critical"
- `acknowledged` (optional): "true" or "false"
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Example**: `/api/alerts?venue_id=xxx&severity=critical&acknowledged=false&page=1&limit=10`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "_id": "alert_id",
        "venue_id": {
          "_id": "venue_id",
          "name": "Central Station",
          "camera_id": "CAM_01"
        },
        "zone_id": {
          "_id": "zone_id",
          "name": "Entrance"
        },
        "severity": "critical",
        "density_value": 15,
        "message": "Entrance: CRITICAL - Zone density reached 15 (threshold: 12)",
        "triggered_at": "2026-01-03T17:30:00.000Z",
        "acknowledged_by": null,
        "acknowledged_at": null
      }
    ],
    "total": 45,
    "page": 1,
    "totalPages": 5
  }
}
```

**Test Cases**:
- Get all alerts
- Filter by venue
- Filter by severity
- Filter by acknowledged status
- Pagination

---

### 6.2 Get Alert by ID
**GET** `/api/alerts/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "alert_id",
    "severity": "critical",
    "density_value": 15,
    "message": "Zone density exceeded",
    "triggered_at": "2026-01-03T17:30:00.000Z"
  }
}
```

---

### 6.3 Acknowledge Alert
**PUT** `/api/alerts/:id/acknowledge`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "_id": "alert_id",
    "acknowledged_by": {
      "_id": "user_id",
      "name": "John Doe"
    },
    "acknowledged_at": "2026-01-03T17:35:00.000Z"
  },
  "message": "Alert acknowledged successfully"
}
```

**Test Cases**:
- Acknowledge unacknowledged alert
- Acknowledge already acknowledged alert
- Invalid alert ID (404 Not Found)

---

## 7. ANALYTICS ENDPOINTS

### 7.1 Get Venue Analytics
**GET** `/api/venues/:id/analytics`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `start_date` (required): ISO date string
- `end_date` (required): ISO date string
- `interval` (optional): "hour", "day" (default: "hour")

**Example**: `/api/venues/:id/analytics?start_date=2026-01-01T00:00:00Z&end_date=2026-01-03T23:59:59Z&interval=hour`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "venue_id": "venue_id",
    "period": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-01-03T23:59:59.000Z"
    },
    "stats": {
      "avg_density": 18.5,
      "peak_density": 42,
      "total_detections": 12450
    },
    "hourly_data": [
      {
        "time_window": "2026-01-01T00:00:00.000Z",
        "avg_density": 15.2,
        "peak_density": 28
      }
    ]
  }
}
```

---

### 7.2 Get Zone Analytics
**GET** `/api/venues/:id/analytics/zone/:zoneId`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**: Same as venue analytics

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "zone_id": "zone_id",
    "zone_name": "Entrance",
    "period": {
      "start": "2026-01-01T00:00:00.000Z",
      "end": "2026-01-03T23:59:59.000Z"
    },
    "stats": {
      "avg_density": 8.3,
      "peak_density": 15
    }
  }
}
```

---

### 7.3 Get Venue Report
**GET** `/api/venues/:id/analytics/report`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (optional): "day", "week", "month" (default: "week")

**Example**: `/api/venues/:id/analytics/report?period=week`

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "venue_id": "venue_id",
    "report_period": "week",
    "summary": {
      "avg_density": 18.5,
      "peak_density": 42,
      "peak_time": "2026-01-02T18:00:00.000Z",
      "total_alerts": 15,
      "critical_alerts": 3,
      "warning_alerts": 12
    },
    "zone_breakdown": [
      {
        "zone_name": "Entrance",
        "avg_density": 8.5,
        "peak_density": 15,
        "alerts": 5
      }
    ]
  }
}
```

---

## 8. FILE UPLOAD ENDPOINTS

### 8.1 Upload Single File
**POST** `/api/upload/single`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `file`: File to upload

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/...jpg",
    "public_id": "uploads/xxx",
    "format": "jpg"
  },
  "message": "File uploaded successfully"
}
```

---

### 8.2 Upload Multiple Files
**POST** `/api/upload/multiple`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `files`: Multiple files (max 10)

**Response** (200):
```json
{
  "status": "success",
  "data": {
    "files": [
      {
        "url": "https://res.cloudinary.com/...jpg",
        "public_id": "uploads/xxx"
      }
    ]
  },
  "message": "Files uploaded successfully"
}
```

---

## 9. HEALTH CHECK

### 9.1 Server Health
**GET** `/health`

**No Authentication Required**

**Response** (200):
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-01-03T17:33:18.584Z",
  "uptime": 3600
}
```

---

## TESTING WORKFLOW

### Step 1: Authentication
1. Register an admin user
2. Manually update user role to "admin" in MongoDB
3. Login to get JWT token
4. Store token for subsequent requests

### Step 2: Venue Setup
1. Create venue (admin)
2. Create zones for venue (admin)
3. Set venue threshold (admin)
4. Set zone thresholds (admin)

### Step 3: Real-time Data
1. Start Python CV system to send metadata
2. Check grid density endpoint
3. Check zone densities endpoint
4. Verify alerts are generated

### Step 4: Analytics
1. Wait for hourly aggregation
2. Query venue analytics
3. Query zone analytics
4. Generate reports

### Step 5: Alert Management
1. View all alerts
2. Filter by severity
3. Acknowledge alerts
4. Verify acknowledgment

---

## COMMON ERROR RESPONSES

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field is required"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Resource already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## ENVIRONMENT SETUP

Required `.env` variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crowd-monitoring
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
```
