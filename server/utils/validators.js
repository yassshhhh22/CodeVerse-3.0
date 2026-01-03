export const validateMetadataJSON = (metadata) => {
  const required = ["camera_id", "detections", "timestamp", "detection_count"];
  
  for (const field of required) {
    if (!(field in metadata)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  if (!Array.isArray(metadata.detections)) {
    return { valid: false, error: "Detections must be an array" };
  }
  
  for (const detection of metadata.detections) {
    if (!detection.x || !detection.y || !detection.w || !detection.h) {
      return { valid: false, error: "Invalid detection format" };
    }
  }
  
  return { valid: true };
};

export const validateVenueConfig = (config) => {
  if (!config.camera_id || !config.name) {
    return { valid: false, error: "Camera ID and name are required" };
  }
  
  if (config.frame_width < 100 || config.frame_height < 100) {
    return { valid: false, error: "Frame dimensions too small" };
  }
  
  if (config.grid_rows < 5 || config.grid_cols < 5) {
    return { valid: false, error: "Grid dimensions must be at least 5x5" };
  }
  
  return { valid: true };
};

export const validateZoneDefinition = (zone, venueGridRows, venueGridCols) => {
  if (!zone.name || !zone.grid_cells) {
    return { valid: false, error: "Zone name and grid cells are required" };
  }
  
  const { start, end } = zone.grid_cells;
  
  if (start.x > end.x || start.y > end.y) {
    return { valid: false, error: "Start coordinates must be less than or equal to end coordinates" };
  }
  
  if (end.x >= venueGridCols || end.y >= venueGridRows) {
    return { valid: false, error: "Zone exceeds venue grid dimensions" };
  }
  
  return { valid: true };
};

export const validateThresholds = (thresholds) => {
  if (thresholds.warning_level < 0 || thresholds.critical_level < 0) {
    return { valid: false, error: "Threshold values must be positive" };
  }
  
  if (thresholds.warning_level >= thresholds.critical_level) {
    return { valid: false, error: "Warning level must be less than critical level" };
  }
  
  return { valid: true };
};
