# CrowdCrawl Web Client

<div align="center">

**Real-Time Crowd Monitoring Dashboard**

Modern, responsive web application for real-time crowd density monitoring and analytics.

[![React](https://img.shields.io/badge/react-19.2.0-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-7.2.4-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.1.18-38bdf8)](https://tailwindcss.com/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Deployment](#deployment)

---

## Overview

The CrowdCrawl Web Client is a modern, responsive single-page application built with React 19 and Vite. It provides real-time visualization of crowd density data, interactive grid displays, zone overlays, alert management, and comprehensive analytics dashboards.

### Key Highlights

- **Real-Time Updates**: WebSocket-powered live data streaming
- **Interactive Visualization**: SVG-based grid heatmaps and detection overlays
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Role-Based Access**: Admin and user dashboards with appropriate permissions
- **Offline Support**: Graceful degradation and connection status indicators

---

## Features

### Real-Time Monitoring

- **Live Grid Visualization**: Dynamic heatmap showing crowd density distribution
- **Detection Overlays**: Real-time bounding boxes on video frames
- **Zone Indicators**: Color-coded zone status (Normal, Warning, Critical)
- **Connection Status**: Real-time system health monitoring
- **Auto-Reconnect**: Automatic WebSocket reconnection on disconnection

### Dashboard Interfaces

#### User Dashboard
- Live grid density visualization
- Real-time alert notifications
- Zone status monitoring
- Historical data access
- Export capabilities

#### Admin Dashboard
- All user features plus:
- Venue management (CRUD operations)
- Zone configuration
- Threshold management
- User management
- System analytics

### Analytics & Reporting

- **Time-Series Charts**: Hourly, daily, weekly, and monthly trends
- **Peak Analysis**: Identify high-density periods
- **Comparative Reports**: Compare metrics across time periods
- **Export Options**: Download reports as CSV/JSON
- **Interactive Filters**: Date range, venue, and zone filtering

### Alert Management

- **Real-Time Notifications**: Instant toast notifications for alerts
- **Alert History**: Complete alert log with filtering
- **Acknowledgment System**: Mark alerts as acknowledged
- **Severity Classification**: Visual indicators for warning/critical levels
- **Sound Notifications**: Optional audio alerts

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework with concurrent features |
| **Vite** | 7.2.4 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Zustand** | 5.0.1 | Lightweight state management |
| **Socket.IO Client** | 4.8.3 | Real-time bidirectional communication |
| **React Router** | 7.2.1 | Client-side routing |
| **Axios** | 1.7.8 | Promise-based HTTP client |
| **Lucide React** | Latest | Beautiful icon library |

---

## Project Structure

```
client/
├── public/                      # Static assets
│   └── assets/                  # Images, fonts, etc.
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AlertToast.jsx       # Alert notification component
│   │   ├── ConnectionStatus.jsx # WebSocket connection indicator
│   │   ├── GridVisualization.jsx # SVG grid heatmap
│   │   ├── ZoneOverlay.jsx      # Zone boundary overlay
│   │   ├── DetectionBox.jsx     # Detection bounding boxes
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Sidebar.jsx          # Admin sidebar
│   │   └── LoadingSpinner.jsx   # Loading indicator
│   │
│   ├── pages/                   # Application pages
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── LoginPage.jsx        # User authentication
│   │   ├── SignupPage.jsx       # User registration
│   │   ├── DashboardPage.jsx    # Main monitoring dashboard
│   │   ├── AdminDashboardPage.jsx # Admin control panel
│   │   ├── HistoricalAnalysisPage.jsx # Analytics dashboard
│   │   ├── UserManagementPage.jsx # User admin page
│   │   └── NotFoundPage.jsx     # 404 error page
│   │
│   ├── store/                   # Zustand state stores
│   │   ├── authStore.js         # Authentication state
│   │   ├── venueStore.js        # Venue data state
│   │   ├── alertStore.js        # Alert management state
│   │   ├── zoneStore.js         # Zone data state
│   │   └── gridStore.js         # Grid density state
│   │
│   ├── services/                # External service integrations
│   │   ├── api.js               # REST API service
│   │   └── websocket.js         # WebSocket service
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js           # Authentication hook
│   │   ├── useWebSocket.js      # WebSocket connection hook
│   │   ├── useGridData.js       # Grid data management hook
│   │   └── useAlerts.js         # Alert management hook
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.js         # App constants
│   │   ├── helpers.js           # Helper functions
│   │   ├── validators.js        # Form validators
│   │   └── formatters.js        # Data formatters
│   │
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Application entry point
│   ├── App.css                  # Global styles
│   └── index.css                # Base styles
│
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── eslint.config.js            # ESLint configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## Installation

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Backend Server**: Running on configured URL

### Step 1: Install Dependencies

```bash
# Navigate to client directory
cd client

# Install all dependencies
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# WebSocket Configuration
VITE_WS_URL=ws://localhost:5000

# Application Configuration
VITE_APP_NAME=CrowdCrawl
VITE_APP_VERSION=1.0.0
```

### Step 3: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` | Yes |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:5000` | Yes |
| `VITE_APP_NAME` | Application name | `CrowdCrawl` | No |
| `VITE_APP_VERSION` | Application version | `1.0.0` | No |

### Vite Configuration

Key configuration in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          socket: ['socket.io-client'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Guidelines

#### Component Structure

```javascript
// ComponentName.jsx
import React from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

#### API Service Pattern

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Building

### Production Build

```bash
npm run build
```

Output directory: `dist/`

### Build Optimization

The production build includes:

- **Code Splitting**: Automatic chunking for vendor and UI libraries
- **Minification**: Terser for JavaScript, cssnano for CSS
- **Tree Shaking**: Removes unused code
- **Asset Optimization**: Image compression and optimization
- **Source Maps**: Generated for debugging

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t crowdcrawl-client .
docker run -p 80:80 crowdcrawl-client
```

---

<div align="center">

**Built with React + Vite for optimal performance**

[Back to Main README](../README.md)

</div>
