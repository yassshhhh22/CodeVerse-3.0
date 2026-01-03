import mongoose from "mongoose";

const thresholdSchema = new mongoose.Schema(
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
    warning_level: {
      type: Number,
      required: [true, "Warning level is required"],
      min: [0, "Warning level must be at least 0"],
    },
    critical_level: {
      type: Number,
      required: [true, "Critical level is required"],
      min: [0, "Critical level must be at least 0"],
    },
  },
  {
    timestamps: true,
  }
);

thresholdSchema.index({ venue_id: 1 });
thresholdSchema.index({ zone_id: 1 });
thresholdSchema.index({ venue_id: 1, zone_id: 1 }, { unique: true });

thresholdSchema.pre("save", function (next) {
  if (this.warning_level >= this.critical_level) {
    return next(new Error("Warning level must be less than critical level"));
  }
  next();
});

const Threshold = mongoose.model("Threshold", thresholdSchema);

export default Threshold;
