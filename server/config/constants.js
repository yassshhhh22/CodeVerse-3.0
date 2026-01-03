export const GRID_DEFAULTS = {
  MIN_ROWS: 5,
  MAX_ROWS: 20,
  DEFAULT_ROWS: 10,
  MIN_COLS: 5,
  MAX_COLS: 20,
  DEFAULT_COLS: 10,
};

export const FRAME_DEFAULTS = {
  MIN_WIDTH: 100,
  MAX_WIDTH: 7680,
  DEFAULT_WIDTH: 1280,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 4320,
  DEFAULT_HEIGHT: 720,
};

export const WEBSOCKET_EVENTS = {
  CV_METADATA: "camera_data",
  GRID_DENSITY_UPDATE: "grid_density_update",
  ZONE_DENSITY_UPDATE: "zone_density_update",
  ALERT_TRIGGERED: "alert_triggered",
  VENUE_STATUS_UPDATE: "venue_status_update",
  SUBSCRIBE_VENUE: "subscribe_venue",
  UNSUBSCRIBE_VENUE: "unsubscribe_venue",
};

export const AGGREGATION_SETTINGS = {
  SMOOTHING_FACTOR: 0.7,
  TIME_WINDOW_MINUTES: 2,
  HOURLY_AGGREGATION_MINUTES: 60,
};

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
