export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    "create_venue",
    "update_venue",
    "delete_venue",
    "create_zone",
    "update_zone",
    "delete_zone",
    "set_thresholds",
    "view_all",
  ],
  [USER_ROLES.USER]: [
    "view_venues",
    "view_zones",
    "view_alerts",
    "acknowledge_alerts",
    "view_analytics",
  ],
};
