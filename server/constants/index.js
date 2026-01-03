// Database Configuration
export const DB_NAME = "hackathon_db";

// HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// User Messages
export const USER_MESSAGES = {
  // Authentication
  AUTH_SUCCESS: "Authentication successful",
  REGISTER_SUCCESS: "Registration successful",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  TOKEN_INVALID: "Invalid token",
  TOKEN_EXPIRED: "Token expired",
  UNAUTHORIZED: "Not authorized to access this route",
  FORBIDDEN: "Access forbidden",

  // User
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_NOT_FOUND: "User not found",
  USER_EXISTS: "User already exists",
  PROFILE_UPDATED: "Profile updated successfully",
  PASSWORD_UPDATED: "Password updated successfully",
  PASSWORD_INCORRECT: "Current password is incorrect",

  // Validation
  VALIDATION_ERROR: "Validation error",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_EMAIL: "Invalid email address",
  INVALID_PASSWORD: "Invalid password",
  PASSWORD_MISMATCH: "Passwords do not match",
  REQUIRED_FIELDS: "Please provide all required fields",

  // File Upload
  FILE_UPLOADED: "File uploaded successfully",
  FILE_UPLOAD_ERROR: "Error uploading file",
  FILE_NOT_FOUND: "File not found",
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds limit",

  // General
  SUCCESS: "Operation successful",
  ERROR: "An error occurred",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Bad request",
  INTERNAL_ERROR: "Internal server error",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",

  // Database
  DB_CONNECTION_SUCCESS: "Database connected successfully",
  DB_CONNECTION_ERROR: "Database connection error",
  DB_OPERATION_ERROR: "Database operation failed",

  // Redis
  REDIS_CONNECTION_SUCCESS: "Redis connected successfully",
  REDIS_CONNECTION_ERROR: "Redis connection error",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",

  // Email
  EMAIL_SENT: "Email sent successfully",
  EMAIL_ERROR: "Error sending email",

  // Payment
  PAYMENT_SUCCESS: "Payment successful",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_PENDING: "Payment pending",
  INVALID_PAYMENT: "Invalid payment details",
};

// API Routes
export const API_ROUTES = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  UPLOAD: "/api/upload",
  HEALTH: "/health",
};

// Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  MODERATOR: "moderator",
};

// Token Expiry
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  RESET_PASSWORD: "10m",
  EMAIL_VERIFICATION: "24h",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    DOCUMENT: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ALL: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  MESSAGE: USER_MESSAGES.RATE_LIMIT_EXCEEDED,
};

// Environment
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

export * from "./alertTypes.js";
export * from "./userRoles.js";
export * from "./venueStatus.js";
export * from "./thresholdDefaults.js";
