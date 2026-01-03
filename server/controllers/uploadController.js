import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { HTTP_STATUS, USER_MESSAGES } from "../constants/index.js";

// Configure Cloudinary (optional - for cloud storage)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
export const uploadSingle = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw ApiError.badRequest("Please upload a file");
  }

  // Upload to Cloudinary (optional)
  // const result = await cloudinary.uploader.upload(req.file.path, {
  //   folder: 'hackathon'
  // });

  const fileData = {
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    // For Cloudinary:
    // url: result.secure_url,
    // cloudinaryId: result.public_id
  };

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    fileData,
    USER_MESSAGES.FILE_UPLOADED
  );
  res.status(response.statusCode).json(response);
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultiple = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest("Please upload files");
  }

  const files = req.files.map((file) => ({
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
  }));

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    {
      count: files.length,
      files,
    },
    USER_MESSAGES.FILE_UPLOADED
  );

  res.status(response.statusCode).json(response);
});
