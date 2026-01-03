import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
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
    severity: {
      type: String,
      enum: ["warning", "critical"],
      required: [true, "Severity is required"],
    },
    density_value: {
      type: Number,
      required: [true, "Density value is required"],
      min: [0, "Density value must be at least 0"],
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    triggered_at: {
      type: Date,
      default: Date.now,
    },
    acknowledged_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    acknowledged_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ venue_id: 1 });
alertSchema.index({ zone_id: 1 });
alertSchema.index({ triggered_at: -1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ acknowledged_by: 1 });

alertSchema.index({ triggered_at: 1 }, { expireAfterSeconds: 7776000 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
