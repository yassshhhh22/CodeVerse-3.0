import api from "./api.js";

const analyticsService = {
  // Get venue analytics
  getVenueAnalytics: async (venueId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/venues/${venueId}/analytics?${queryString}`
      : `/api/venues/${venueId}/analytics`;
    const response = await api.get(url);
    return response.data;
  },

  // Get zone analytics
  getZoneAnalytics: async (venueId, zoneId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/venues/${venueId}/analytics/zone/${zoneId}?${queryString}`
      : `/api/venues/${venueId}/analytics/zone/${zoneId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get venue report
  getVenueReport: async (venueId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/venues/${venueId}/analytics/report?${queryString}`
      : `/api/venues/${venueId}/analytics/report`;
    const response = await api.get(url);
    return response.data;
  },
};

export default analyticsService;
