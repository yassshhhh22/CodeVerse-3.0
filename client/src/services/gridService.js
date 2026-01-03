import api from "./api.js";

const gridService = {
  // Get grid density for a venue
  getGridDensity: async (venueId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/venues/${venueId}/grid/density?${queryString}`
      : `/api/venues/${venueId}/grid/density`;
    const response = await api.get(url);
    return response.data;
  },

  // Get zone densities for a venue
  getZoneDensities: async (venueId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/api/venues/${venueId}/grid/zone-densities?${queryString}`
      : `/api/venues/${venueId}/grid/zone-densities`;
    const response = await api.get(url);
    return response.data;
  },
};

export default gridService;
