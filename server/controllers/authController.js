import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS, USER_MESSAGES } from "../constants/index.js";

// Validation rules
export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(USER_MESSAGES.VALIDATION_ERROR, errors.array());
  }

  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw ApiError.conflict(USER_MESSAGES.USER_EXISTS);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  sendTokenResponse(
    user,
    HTTP_STATUS.CREATED,
    res,
    USER_MESSAGES.REGISTER_SUCCESS
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest(USER_MESSAGES.VALIDATION_ERROR, errors.array());
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized(USER_MESSAGES.INVALID_CREDENTIALS);
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized(USER_MESSAGES.INVALID_CREDENTIALS);
  }

  sendTokenResponse(user, HTTP_STATUS.OK, res, USER_MESSAGES.LOGIN_SUCCESS);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const response = new ApiResponse(HTTP_STATUS.OK, user, USER_MESSAGES.SUCCESS);
  res.status(response.statusCode).json(response);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    null,
    USER_MESSAGES.LOGOUT_SUCCESS
  );
  res.status(response.statusCode).json(response);
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
    avatar: req.body.avatar,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    user,
    USER_MESSAGES.PROFILE_UPDATED
  );
  res.status(response.statusCode).json(response);
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw ApiError.unauthorized(USER_MESSAGES.PASSWORD_INCORRECT);
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, HTTP_STATUS.OK, res, USER_MESSAGES.PASSWORD_UPDATED);
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (
  user,
  statusCode,
  res,
  message = USER_MESSAGES.SUCCESS
) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
};
