import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../constants/index.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    throw ApiError.forbidden("Admin access required");
  }

  next();
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden("Insufficient permissions");
    }

    next();
  };
};
