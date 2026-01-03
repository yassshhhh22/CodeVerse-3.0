import api from "./api.js";

const userService = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await api.get("/api/users");
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data;
  },
};

export default userService;
