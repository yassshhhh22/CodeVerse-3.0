/**
 * Camera Health Check Job
 * Cron trigger: Every 30 seconds
 * Action: Check last_metadata_time for each venue
 * Updates venue status: active / data_delayed / offline
 * Threshold: > 10 seconds without data = data_delayed
 */

// TODO: Camera health check cron job logic
