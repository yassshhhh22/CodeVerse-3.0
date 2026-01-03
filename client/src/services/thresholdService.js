import api from "./api.js";

const thresholdService = {
  // Get venue thresholds
  getVenueThresholds: async (venueId) => {
    const response = await api.get(`/api/venues/${venueId}/thresholds/venue`);
    return response.data;
  },

  // Set venue threshold
  setVenueThreshold: async (venueId, thresholdData) => {
    const response = await api.put(
      `/api/venues/${venueId}/thresholds/venue`,
      thresholdData
    );
    return response.data;
  },

  // Get zone threshold
  getZoneThreshold: async (venueId, zoneId) => {
    const response = await api.get(
      `/api/venues/${venueId}/thresholds/zone/${zoneId}`
    );
    return response.data;
  },

  // Set zone threshold
  setZoneThreshold: async (venueId, zoneId, thresholdData) => {
    const response = await api.put(
      `/api/venues/${venueId}/thresholds/zone/${zoneId}`,
      thresholdData
    );
    return response.data;
  },
};

export default thresholdService;
