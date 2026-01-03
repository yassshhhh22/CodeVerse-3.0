# Crowd Monitoring System - Complete Flow

## System Architecture Overview

```
Python CV System → Node.js Backend → Frontend Dashboard
     (Edge)           (Processing)        (Visualization)
```

---

## 1. USER ROLES & AUTHENTICATION

### Admin User Flow
1. **Registration**: POST `/api/auth/register` with role="admin"
2. **Login**: POST `/api/auth/login` → receives JWT token
3. **Permissions**:
   - Create/Update/Delete Venues
   - Create/Update/Delete Zones
   - Set Thresholds (venue & zone level)
   - View all data
   - Acknowledge alerts

### Normal User Flow
1. **Registration**: POST `/api/auth/register` with role="user" (default)
2. **Login**: POST `/api/auth/login` → receives JWT token
3. **Permissions**:
   - View venues
   - View zones
   - View real-time grid density
   - View analytics
   - Acknowledge alerts

---

## 2. ADMIN SETUP WORKFLOW

### Step 1: Create Venue
**Endpoint**: `POST /api/venues`
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
**Result**: Venue created with 10×10 grid configuration

### Step 2: Create Zones
**Endpoint**: `POST /api/venues/:id/zones`
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
**Result**: Zone mapped to grid cells (0,0) to (3,5)

### Step 3: Set Thresholds
**Venue Level**: `PUT /api/venues/:id/thresholds/venue`
```json
{
  "warning_level": 25,
  "critical_level": 40
}
```

**Zone Level**: `PUT /api/venues/:id/thresholds/zone/:zoneId`
```json
{
  "warning_level": 8,
  "critical_level": 12
}
```

---

## 3. PYTHON CV SYSTEM INTEGRATION

### Connection Flow
1. **Python Starts**: Runs `main.py` with video source
2. **WebSocket Connect**: Connects to `ws://localhost:5000` (Node.js backend)
3. **Sends Metadata**: Every 5 seconds (configurable)

### Metadata Format
```json
{
  "camera_id": "CAM_01",
  "detections": [
    { "x": 239, "y": 45, "w": 913, "h": 666 },
    { "x": 0, "y": 152, "w": 340, "h": 557 }
  ],
  "timestamp": "2026-01-03T17:33:18.584470",
  "detection_count": 2
}
```

### Event Name
Python sends: `socket.emit('camera_data', metadata)`
Node.js receives: `socket.on('camera_data', async (metadata) => { ... })`

---

## 4. BACKEND PROCESSING PIPELINE

### Stage 1: Receive Metadata
**Handler**: `cvMetadataHandler.js`
- Validates JSON structure
- Finds venue by `camera_id`
- Updates `last_metadata_time`

### Stage 2: Calculate Grid Density
**Service**: `gridDensityService.js`
- Maps each detection to grid cell:
  ```javascript
  centerX = x + w/2
  centerY = y + h/2
  cellX = floor(centerX / (frameWidth / gridCols))
  cellY = floor(centerY / (frameHeight / gridRows))
  matrix[cellY][cellX]++
  ```
- Output: 10×10 density matrix

### Stage 3: Map to Zones
**Service**: `zoneGridService.js`
- For each detection, checks which zone it falls into
- Based on center point and zone grid cell ranges
- Output: `{ zone_id: count }` mapping

### Stage 4: Save to Database
**Service**: `densityAggregationService.js`
- Saves GridDensity document (temporary)
- Used for real-time display and hourly aggregation

### Stage 5: Check Thresholds
**Service**: `thresholdService.js`
- Compares total venue density vs venue threshold
- Compares each zone density vs zone threshold
- Returns violations with severity (warning/critical)

### Stage 6: Generate Alerts
**Service**: `alertService.js`
- Creates Alert document if threshold exceeded
- Cooldown: 5 minutes (prevents spam)
- Saves to database

### Stage 7: Broadcast to Frontend
**WebSocket**: `clientSocketHandler.js`
- Emits to room `venue_CAM_01`:
  - `grid_density_update` → 10×10 matrix
  - `zone_density_update` → zone counts
  - `alert_triggered` → alert details

---

## 5. FRONTEND USER WORKFLOW

### Connecting to Backend
1. **Authenticate**: Login via `/api/auth/login`
2. **Connect WebSocket**: `socket.connect('ws://localhost:5000')`
3. **Subscribe to Venue**: `socket.emit('subscribe_venue', { camera_id: 'CAM_01' })`

### Real-time Updates
**Frontend receives**:
```javascript
socket.on('grid_density_update', (data) => {
  // data.matrix = [[0,1,2,...], [0,0,1,...], ...]
  // Render heatmap
});

socket.on('zone_density_update', (data) => {
  // data.zones = [{ zone_name: 'Entrance', count: 5 }, ...]
  // Update zone stats
});

socket.on('alert_triggered', (alert) => {
  // Show notification: "Entrance Zone: WARNING - 9 people"
});
```

### Fetching Data via API
**Grid Density**: `GET /api/venues/:id/grid/density`
**Zone Densities**: `GET /api/venues/:id/grid/zone-densities`
**Alerts**: `GET /api/alerts?venue_id=xxx&severity=critical`
**Analytics**: `GET /api/venues/:id/analytics?start_date=...&end_date=...`

### Acknowledging Alerts
**Endpoint**: `PUT /api/alerts/:id/acknowledge`
**Action**: Marks alert as acknowledged by current user

---

## 6. BACKGROUND JOBS

### Hourly Aggregation (Every 60 minutes)
**Job**: `densityAggregatorJob.js`
**Actions**:
1. Fetch all GridDensity records from last hour
2. Calculate `avg_density` and `peak_density`
3. Save to DensityLog (historical)
4. Clear old GridDensity records

### Camera Health Check (Every 30 seconds)
**Job**: `cameraHealthCheckJob.js`
**Actions**:
1. Check `last_metadata_time` for each venue
2. If > 10 seconds: status = "data_delayed"
3. If > 60 seconds: status = "inactive"
4. Broadcast status update to frontend

---

## 7. COMPLETE API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Venues (Admin CRUD, Users View)
- `POST /api/venues` - Create venue (admin)
- `GET /api/venues` - List all venues
- `GET /api/venues/:id` - Get single venue
- `PUT /api/venues/:id` - Update venue (admin)
- `DELETE /api/venues/:id` - Delete venue (admin)

### Zones (Admin CRUD, Users View)
- `POST /api/venues/:id/zones` - Create zone (admin)
- `GET /api/venues/:id/zones` - List zones for venue
- `GET /api/venues/:id/zones/:zoneId` - Get single zone
- `PUT /api/venues/:id/zones/:zoneId` - Update zone (admin)
- `DELETE /api/venues/:id/zones/:zoneId` - Delete zone (admin)

### Thresholds (Admin Set, Users View)
- `PUT /api/venues/:id/thresholds/venue` - Set venue threshold (admin)
- `PUT /api/venues/:id/thresholds/zone/:zoneId` - Set zone threshold (admin)
- `GET /api/venues/:id/thresholds/venue` - Get venue thresholds
- `GET /api/venues/:id/thresholds/zone/:zoneId` - Get zone threshold

### Real-time Data (All Users)
- `GET /api/venues/:id/grid/density` - Get current 10×10 matrix
- `GET /api/venues/:id/grid/zone-densities` - Get all zone densities

### Alerts (All Users)
- `GET /api/alerts` - List alerts (with filters: venue_id, severity, acknowledged)
- `GET /api/alerts/:id` - Get single alert
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert

### Analytics (All Users)
- `GET /api/venues/:id/analytics` - Venue historical data
- `GET /api/venues/:id/analytics/zone/:zoneId` - Zone historical data
- `GET /api/venues/:id/analytics/report?period=week` - Weekly report

---

## 8. WEBSOCKET EVENTS

### Python CV → Backend
- **Event**: `camera_data`
- **Data**: `{ camera_id, detections, timestamp, detection_count }`

### Backend → Frontend
- **Event**: `grid_density_update`
- **Data**: `{ venue_id, camera_id, matrix, timestamp }`

- **Event**: `zone_density_update`
- **Data**: `{ venue_id, camera_id, zones: [{ zone_name, count }], timestamp }`

- **Event**: `alert_triggered`
- **Data**: `{ venue_id, zone_id, severity, message, density_value }`

- **Event**: `venue_status_update`
- **Data**: `{ camera_id, venue_id, status, last_metadata_time }`

### Frontend → Backend
- **Event**: `subscribe_venue`
- **Data**: `{ camera_id, user }`

- **Event**: `unsubscribe_venue`
- **Data**: `{ camera_id }`

---

## 9. DATABASE MODELS

### User
- Fields: email, password_hash, role, name
- Indexes: email (unique)

### Venue
- Fields: camera_id (unique), name, frame dimensions, grid config, status, last_metadata_time, created_by
- Indexes: camera_id, created_by, status

### Zone
- Fields: venue_id, name, grid_cells (start/end), created_by
- Indexes: venue_id, created_by

### Threshold
- Fields: venue_id, zone_id (nullable), warning_level, critical_level
- Indexes: venue_id, zone_id, compound unique (venue+zone)

### Alert
- Fields: venue_id, zone_id, severity, density_value, message, triggered_at, acknowledged_by, acknowledged_at
- Indexes: venue_id, zone_id, triggered_at, severity
- TTL: 90 days auto-delete

### GridDensity (Temporary)
- Fields: venue_id, matrix (2D array), timestamp, aggregation_window
- Purpose: Real-time storage, cleared hourly

### DensityLog (Historical)
- Fields: venue_id, zone_id, time_window, avg_density, peak_density, total_detections
- Purpose: Analytics and reports

---

## 10. SAMPLE USER JOURNEY

### Day 1: Admin Setup
1. Admin registers: `POST /api/auth/register { email, password, role: "admin" }`
2. Admin logs in: `POST /api/auth/login`
3. Admin creates venue "CAM_01" with 10×10 grid
4. Admin creates 3 zones: "Entrance", "Main Floor", "Exit"
5. Admin sets thresholds: Venue (25/40), Entrance (8/12)

### Day 1: Python CV Starts
1. Python connects to `ws://localhost:5000`
2. Python sends metadata every 5 seconds
3. Backend processes and saves to database
4. No alerts yet (low crowd)

### Day 2: Normal User Monitoring
1. User logs in to dashboard
2. User subscribes to "CAM_01"
3. User sees:
   - Real-time heatmap (10×10 grid)
   - Zone stats (Entrance: 3, Main Floor: 12, Exit: 2)
   - Status: All green (below warning)

### Day 2: Peak Hour (Threshold Exceeded)
1. Crowd increases: Entrance zone reaches 9 people
2. Backend detects: 9 > 8 (warning threshold)
3. Backend creates warning alert
4. Frontend receives `alert_triggered` event
5. User sees: "Entrance Zone: WARNING - 9 people (threshold: 8)"
6. User clicks "Acknowledge" → `PUT /api/alerts/:id/acknowledge`

### Day 3: Analytics Review
1. Admin checks: `GET /api/venues/CAM_01/analytics/report?period=week`
2. Admin sees:
   - Peak density: 42 people (occurred at 6 PM)
   - Average density: 18.5 people
   - Entrance zone: 3 critical alerts, 12 warnings
3. Admin adjusts thresholds if needed

---

## 11. ERROR HANDLING

### Python CV Connection Lost
- Camera health check detects stale `last_metadata_time`
- After 10 seconds: status → "data_delayed"
- After 60 seconds: status → "inactive"
- Frontend shows: "Camera Offline"

### Invalid Metadata
- Backend validates: camera_id exists, detections is array
- If invalid: logs error, skips processing
- Python doesn't get error feedback (one-way stream)

### Threshold Violations
- Cooldown prevents alert spam (5 min)
- Multiple zones can trigger simultaneously
- Each alert saved separately

---

## 12. STARTING THE SYSTEM

### Prerequisites
1. MongoDB running
2. Node.js installed
3. Python with dependencies installed

### Step 1: Start Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with MongoDB URI
npm start
```

### Step 2: Start Python CV
```bash
cd cv
python main.py
# Or with video file: python main.py video.mp4
```

### Step 3: Access API
- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/health`
- WebSocket: `ws://localhost:5000`

---

## 13. SYSTEM MONITORING

### Health Check Endpoint
`GET /health` returns:
```json
{
  "status": "success",
  "timestamp": "2026-01-03T17:33:18Z",
  "uptime": 3600,
  "database": "connected",
  "websocket": "active",
  "jobs": "running"
}
```

### Logs Location
- Application logs: Via Winston logger
- Request logs: All HTTP requests
- WebSocket logs: Connection/disconnection events

---

## SECURITY NOTES

### Authentication
- JWT tokens in Authorization header
- Token expires after 7 days
- Password hashed with bcrypt

### Authorization
- Role-based access control
- Admin vs User permissions enforced at route level
- MongoDB injection prevention (express-mongo-sanitize)

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all `/api/*` endpoints

### Privacy Compliance
- No video frames stored
- Only bounding box coordinates processed
- No facial recognition
- Anonymized crowd-level data only
