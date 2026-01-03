import Alert from "../models/Alert.js";

const ALERT_COOLDOWN_MINUTES = 5;

const shouldCreateAlert = async (venueId, zoneId, severity) => {
  const cooldownTime = new Date(Date.now() - ALERT_COOLDOWN_MINUTES * 60 * 1000);
  
  const query = {
    venue_id: venueId,
    severity,
    triggered_at: { $gte: cooldownTime },
  };
  
  if (zoneId) {
    query.zone_id = zoneId;
  } else {
    query.zone_id = null;
  }
  
  const recentAlert = await Alert.findOne(query);
  return !recentAlert;
};

const generateAlert = async (venueId, zoneId, severity, density, message) => {
  const canCreate = await shouldCreateAlert(venueId, zoneId, severity);
  
  if (!canCreate) {
    return null;
  }
  
  const alert = new Alert({
    venue_id: venueId,
    zone_id: zoneId || null,
    severity,
    density_value: density,
    message,
    triggered_at: new Date(),
  });
  
  await alert.save();
  return alert;
};

const generateVenueAlert = async (venueId, violation, venueName) => {
  const message = `${venueName}: ${violation.severity.toUpperCase()} - Crowd density reached ${violation.density} (threshold: ${violation.threshold_value})`;
  
  return await generateAlert(
    venueId,
    null,
    violation.severity,
    violation.density,
    message
  );
};

const generateZoneAlert = async (venueId, violation) => {
  const message = `${violation.zone_name}: ${violation.severity.toUpperCase()} - Zone density reached ${violation.density} (threshold: ${violation.threshold_value})`;
  
  return await generateAlert(
    venueId,
    violation.zone_id,
    violation.severity,
    violation.density,
    message
  );
};

const acknowledgeAlert = async (alertId, userId) => {
  const alert = await Alert.findById(alertId);
  
  if (!alert) {
    return null;
  }
  
  alert.acknowledged_by = userId;
  alert.acknowledged_at = new Date();
  await alert.save();
  
  return alert;
};

export { generateAlert, generateVenueAlert, generateZoneAlert, acknowledgeAlert, shouldCreateAlert };
