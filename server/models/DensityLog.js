import mongoose from "mongoose";

const densityLogSchema = new mongoose.Schema(
  {
    venue_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Venue ID is required"],
    },
    zone_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    time_window: {
      type: String,
      required: [true, "Time window is required"],
      trim: true,
    },
    avg_density: {
      type: Number,
      required: [true, "Average density is required"],
      min: [0, "Average density must be at least 0"],
    },
    peak_density: {
      type: Number,
      required: [true, "Peak density is required"],
      min: [0, "Peak density must be at least 0"],
    },
    total_detections: {
      type: Number,
      required: [true, "Total detections is required"],
      min: [0, "Total detections must be at least 0"],
    },
  },
  {
    timestamps: true,
  }
);

densityLogSchema.index({ venue_id: 1 });
densityLogSchema.index({ zone_id: 1 });
densityLogSchema.index({ time_window: 1 });
densityLogSchema.index({ venue_id: 1, zone_id: 1, time_window: 1 }, { unique: true });
densityLogSchema.index({ venue_id: 1, time_window: -1 });

const DensityLog = mongoose.model("DensityLog", densityLogSchema);

export default DensityLog;
