import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { USER_MESSAGES } from "../constants/index.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    throw ApiError.unauthorized(USER_MESSAGES.UNAUTHORIZED);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw ApiError.unauthorized(USER_MESSAGES.USER_NOT_FOUND);
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw ApiError.unauthorized(USER_MESSAGES.TOKEN_INVALID);
    }
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized(USER_MESSAGES.TOKEN_EXPIRED);
    }
    throw error;
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};
