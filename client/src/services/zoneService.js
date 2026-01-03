import api from "./api.js";

const zoneService = {
  // Get all zones for a venue
  getZonesByVenue: async (venueId) => {
    const response = await api.get(`/api/venues/${venueId}/zones`);
    return response.data;
  },

  // Get zone by ID
  getZoneById: async (venueId, zoneId) => {
    const response = await api.get(`/api/venues/${venueId}/zones/${zoneId}`);
    return response.data;
  },

  // Create new zone
  createZone: async (venueId, zoneData) => {
    const response = await api.post(`/api/venues/${venueId}/zones`, zoneData);
    return response.data;
  },

  // Update zone
  updateZone: async (venueId, zoneId, zoneData) => {
    const response = await api.put(
      `/api/venues/${venueId}/zones/${zoneId}`,
      zoneData
    );
    return response.data;
  },

  // Delete zone
  deleteZone: async (venueId, zoneId) => {
    const response = await api.delete(`/api/venues/${venueId}/zones/${zoneId}`);
    return response.data;
  },
};

export default zoneService;
