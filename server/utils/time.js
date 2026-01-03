/**
 * Get formatted timestamp for logging
 * @returns {string} Formatted timestamp
 */
export const getLogTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

/**
 * Get date in YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
export const getFormattedDate = (date = new Date()) => {
  return date.toISOString().split("T")[0];
};

/**
 * Get time in HH:MM:SS format
 * @param {Date} date - Date object
 * @returns {string} Formatted time
 */
export const getFormattedTime = (date = new Date()) => {
  return date.toTimeString().split(" ")[0];
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} True if expired
 */
export const isExpired = (date) => {
  return new Date() > new Date(date);
};

/**
 * Get time difference in milliseconds
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number} Difference in milliseconds
 */
export const getTimeDifference = (start, end = new Date()) => {
  return end.getTime() - start.getTime();
};
