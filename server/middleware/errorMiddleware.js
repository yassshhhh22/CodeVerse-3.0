import logger from "../config/logger.js";
import { HTTP_STATUS, USER_MESSAGES } from "../constants/index.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    err.statusCode || res.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || USER_MESSAGES.INTERNAL_ERROR;

  // If statusCode is 200, it means error was thrown without proper status
  if (statusCode === HTTP_STATUS.OK) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = USER_MESSAGES.NOT_FOUND;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = errors.join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = USER_MESSAGES.TOKEN_INVALID;
  }

  if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = USER_MESSAGES.TOKEN_EXPIRED;
  }

  // Log error
  logger.logError(err, req);

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};
