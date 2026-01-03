import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  User as UserIcon,
  Save,
  X,
  AlertCircle,
  Check,
  Mail,
  Lock,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import UserMenu from "../components/UserMenu";
import api from "../services/api";

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/users");
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/register", formData);
      if (response.data.success) {
        setSuccess("User created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId) => {
    setError(null);
    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      const response = await api.put(`/api/users/${userId}`, updateData);
      if (response.data.success) {
        setSuccess("User updated successfully!");
        setEditingUser(null);
        resetForm();
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await api.delete(`/api/users/${userId}`);
      if (response.data.success) {
        setSuccess("User deleted successfully!");
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || "Failed to delete user");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    if (!confirm(`Change user role to ${newRole}?`)) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await api.put(`/api/users/${userId}`, { role: newRole });
      if (response.data.success) {
        setSuccess(`User role changed to ${newRole}!`);
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || "Failed to update role");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Users className="text-accent" size={32} />
                User Management
              </h1>
              <p className="text-secondary">Manage system users and roles</p>
            </div>
            <UserMenu />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-2">
            <Check className="text-green-500" size={20} />
            <p className="text-green-500">{success}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-primary/20 rounded-lg focus:outline-none focus:border-accent"
            />
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-semibold"
          >
            <Plus size={20} />
            Create User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-primary" />
              <span className="text-sm text-secondary">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>

          <div className="bg-surface border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-accent" />
              <span className="text-sm text-secondary">Administrators</span>
            </div>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>

          <div className="bg-surface border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon size={16} className="text-primary" />
              <span className="text-sm text-secondary">Regular Users</span>
            </div>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.role === "user").length}
            </p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-surface border border-primary/20 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-secondary mt-4">Loading users...</p>
            </div>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-secondary/50 mb-3" />
              <p className="text-secondary">No users found</p>
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">
                      User
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">
                      Created
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-border hover:bg-background/50 transition-colors"
                    >
                      {editingUser === user._id ? (
                        // Edit Mode
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                              placeholder="Name"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                              placeholder="Email"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={formData.role}
                              onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-secondary">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateUser(user._id)}
                                className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                                title="Save"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="font-semibold text-primary">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold">{user.name}</p>
                                {user._id === currentUser?._id && (
                                  <span className="text-xs text-accent">(You)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">{user.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleRole(user._id, user.role)}
                              disabled={user._id === currentUser?._id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                user.role === "admin"
                                  ? "bg-accent/20 text-accent hover:bg-accent/30"
                                  : "bg-primary/20 text-primary hover:bg-primary/30"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {user.role === "admin" ? (
                                <Shield size={12} />
                              ) : (
                                <UserIcon size={12} />
                              )}
                              {user.role}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-secondary">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(user)}
                                disabled={user._id === currentUser?._id}
                                className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                disabled={user._id === currentUser?._id}
                                className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-primary/20 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create New User</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                    size={18}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
                    size={18}
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-background border border-border rounded-lg hover:bg-background/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
