import api from "./api.js";

const alertService = {
  // Get all alerts with optional filters
  getAlerts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/alerts?${queryString}` : "/api/alerts";
    const response = await api.get(url);
    return response.data;
  },

  // Get alert by ID
  getAlertById: async (alertId) => {
    const response = await api.get(`/api/alerts/${alertId}`);
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId) => {
    const response = await api.put(`/api/alerts/${alertId}/acknowledge`);
    return response.data;
  },
};

export default alertService;
