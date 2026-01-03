export const VENUE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DATA_DELAYED: "data_delayed",
};

export const VENUE_STATUS_DESCRIPTIONS = {
  [VENUE_STATUS.ACTIVE]: "Camera is active and sending data",
  [VENUE_STATUS.INACTIVE]: "Camera is offline or not sending data",
  [VENUE_STATUS.DATA_DELAYED]: "Camera data is delayed or intermittent",
};

export const HEALTH_CHECK_THRESHOLDS = {
  DATA_DELAY_SECONDS: 10,
  OFFLINE_SECONDS: 60,
};
