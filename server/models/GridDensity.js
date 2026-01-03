import mongoose from "mongoose";

const gridDensitySchema = new mongoose.Schema(
  {
    venue_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Venue ID is required"],
    },
    matrix: {
      type: [[Number]],
      required: [true, "Grid density matrix is required"],
      validate: {
        validator: function (matrix) {
          if (!Array.isArray(matrix) || matrix.length === 0) return false;
          const rows = matrix.length;
          const cols = matrix[0].length;
          return matrix.every(row => Array.isArray(row) && row.length === cols);
        },
        message: "Matrix must be a valid 2D array with consistent dimensions",
      },
    },
    timestamp: {
      type: Date,
      required: [true, "Timestamp is required"],
      default: Date.now,
    },
    aggregation_window: {
      type: String,
      required: [true, "Aggregation window is required"],
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

gridDensitySchema.index({ venue_id: 1 });
gridDensitySchema.index({ timestamp: -1 });
gridDensitySchema.index({ venue_id: 1, timestamp: -1 });

const GridDensity = mongoose.model("GridDensity", gridDensitySchema);

export default GridDensity;
