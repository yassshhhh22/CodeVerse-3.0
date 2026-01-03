import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, Shield, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-background font-semibold text-sm">
          {getUserInitials(user?.username || user?.email)}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold">{user?.username || "User"}</div>
          {isAdmin && (
            <div className="text-xs text-accent flex items-center gap-1">
              <Shield size={10} />
              Admin
            </div>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-primary/30 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* User Info Section */}
          <div className="p-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-background font-bold text-lg">
                {getUserInitials(user?.username || user?.email)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text">
                  {user?.username || "User"}
                </div>
                <div className="text-xs text-secondary truncate">
                  {user?.email || "user@example.com"}
                </div>
                {isAdmin && (
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">
                    <Shield size={10} />
                    Administrator
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard");
              }}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-primary/10 transition-colors"
            >
              <UserCircle size={18} className="text-accent" />
              <span className="text-sm">Dashboard</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/admin");
                }}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-primary/10 transition-colors"
              >
                <Shield size={18} className="text-accent" />
                <span className="text-sm">Admin Panel</span>
              </button>
            )}

            <div className="my-2 border-t border-primary/20"></div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-500/10 text-red-500 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
