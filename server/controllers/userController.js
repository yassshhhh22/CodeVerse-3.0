import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS, USER_MESSAGES } from "../constants/index.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password");

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    {
      count: users.length,
      users,
    },
    USER_MESSAGES.SUCCESS
  );

  res.status(response.statusCode).json(response);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound(USER_MESSAGES.USER_NOT_FOUND);
  }

  const response = new ApiResponse(HTTP_STATUS.OK, user, USER_MESSAGES.SUCCESS);
  res.status(response.statusCode).json(response);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound(USER_MESSAGES.USER_NOT_FOUND);
  }

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    user,
    USER_MESSAGES.USER_UPDATED
  );
  res.status(response.statusCode).json(response);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw ApiError.notFound(USER_MESSAGES.USER_NOT_FOUND);
  }

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    null,
    USER_MESSAGES.USER_DELETED
  );
  res.status(response.statusCode).json(response);
});
