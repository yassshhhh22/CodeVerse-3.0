import api from "./api.js";

const venueService = {
  // Get all venues
  getVenues: async () => {
    const response = await api.get("/api/venues");
    return response.data;
  },

  // Get venue by ID
  getVenueById: async (venueId) => {
    const response = await api.get(`/api/venues/${venueId}`);
    return response.data;
  },

  // Create new venue
  createVenue: async (venueData) => {
    const response = await api.post("/api/venues", venueData);
    return response.data;
  },

  // Update venue
  updateVenue: async (venueId, venueData) => {
    const response = await api.put(`/api/venues/${venueId}`, venueData);
    return response.data;
  },

  // Delete venue
  deleteVenue: async (venueId) => {
    const response = await api.delete(`/api/venues/${venueId}`);
    return response.data;
  },
};

export default venueService;
