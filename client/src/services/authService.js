import api from "./api.js";

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  // Logout user (client-side only)
  logout: () => {
    return { success: true, message: "Logged out successfully" };
  },

  // Update user details
  updateDetails: async (details) => {
    const response = await api.put("/api/auth/updatedetails", details);
    return response.data;
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await api.put("/api/auth/updatepassword", passwords);
    return response.data;
  },
};

export default authService;
