import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    camera_id: {
      type: String,
      required: [true, "Camera ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
      maxlength: [100, "Venue name cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "data_delayed"],
      default: "active",
    },
    frame_width: {
      type: Number,
      required: [true, "Frame width is required"],
      min: [100, "Frame width must be at least 100"],
      max: [7680, "Frame width cannot exceed 7680"],
      default: 1280,
    },
    frame_height: {
      type: Number,
      required: [true, "Frame height is required"],
      min: [100, "Frame height must be at least 100"],
      max: [4320, "Frame height cannot exceed 4320"],
      default: 720,
    },
    grid_rows: {
      type: Number,
      required: [true, "Grid rows is required"],
      min: [5, "Grid rows must be at least 5"],
      max: [20, "Grid rows cannot exceed 20"],
      default: 10,
    },
    grid_cols: {
      type: Number,
      required: [true, "Grid columns is required"],
      min: [5, "Grid columns must be at least 5"],
      max: [20, "Grid columns cannot exceed 20"],
      default: 10,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required"],
    },
    last_metadata_time: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

venueSchema.index({ created_by: 1 });
venueSchema.index({ status: 1 });

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
