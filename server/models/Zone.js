import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    venue_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: [true, "Venue ID is required"],
    },
    name: {
      type: String,
      required: [true, "Zone name is required"],
      trim: true,
      maxlength: [100, "Zone name cannot exceed 100 characters"],
    },
    grid_cells: {
      start: {
        x: {
          type: Number,
          required: [true, "Start cell X coordinate is required"],
          min: [0, "Start X must be at least 0"],
        },
        y: {
          type: Number,
          required: [true, "Start cell Y coordinate is required"],
          min: [0, "Start Y must be at least 0"],
        },
      },
      end: {
        x: {
          type: Number,
          required: [true, "End cell X coordinate is required"],
          min: [0, "End X must be at least 0"],
        },
        y: {
          type: Number,
          required: [true, "End cell Y coordinate is required"],
          min: [0, "End Y must be at least 0"],
        },
      },
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator user ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

zoneSchema.index({ venue_id: 1 });
zoneSchema.index({ created_by: 1 });

zoneSchema.pre("save", function (next) {
  if (this.grid_cells.start.x > this.grid_cells.end.x) {
    return next(new Error("Start X must be less than or equal to End X"));
  }
  if (this.grid_cells.start.y > this.grid_cells.end.y) {
    return next(new Error("Start Y must be less than or equal to End Y"));
  }
  next();
});

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
