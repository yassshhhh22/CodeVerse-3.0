import { useState, useEffect } from "react";
import { Settings, Grid3x3, MapPin, Save, Trash2, Plus, AlertCircle } from "lucide-react";
import VenueSelector from "../components/VenueSelector";
import ZoneDefinition from "../components/ZoneDefinition";
import ZoneList from "../components/ZoneList";
import UserMenu from "../components/UserMenu";
import { useVenueStore } from "../store/VenueStore";
import { useZoneStore } from "../store/ZoneStore";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

// Mock data for testing frontend
const MOCK_VENUES = [
  {
    _id: "1",
    camera_id: "CAM001",
    name: "CodeVerse Main Hall",
    status: "active",
    frame_width: 1280,
    frame_height: 720,
    grid_rows: 10,
    grid_cols: 10,
  },
  {
    _id: "2",
    camera_id: "CAM002",
    name: "Conference Room A",
    status: "active",
    frame_width: 1920,
    frame_height: 1080,
    grid_rows: 12,
    grid_cols: 12,
  },
  {
    _id: "3",
    camera_id: "CAM003",
    name: "Exhibition Area",
    status: "active",
    frame_width: 1280,
    frame_height: 720,
    grid_rows: 15,
    grid_cols: 15,
  },
  {
    _id: "4",
    camera_id: "CAM004",
    name: "Food Court",
    status: "data_delayed",
    frame_width: 1280,
    frame_height: 720,
    grid_rows: 10,
    grid_cols: 10,
  },
];

const MOCK_ZONES = {
  "1": [
    {
      _id: "z1",
      name: "Stage Area",
      grid_cells: {
        start: { x: 0, y: 0 },
        end: { x: 3, y: 3 },
      },
    },
    {
      _id: "z2",
      name: "VIP Section",
      grid_cells: {
        start: { x: 7, y: 0 },
        end: { x: 9, y: 2 },
      },
    },
  ],
  "2": [
    {
      _id: "z3",
      name: "Presentation Area",
      grid_cells: {
        start: { x: 0, y: 0 },
        end: { x: 11, y: 3 },
      },
    },
  ],
  "3": [],
  "4": [],
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isDefiningZone, setIsDefiningZone] = useState(false);
  const [currentZoneName, setCurrentZoneName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Zustand stores
  const { user } = useAuthStore();
  const { venues, fetchVenues, isLoading: venuesLoading } = useVenueStore();
  const { 
    zones, 
    fetchZonesByVenue, 
    createZone, 
    deleteZone,
    isLoading: zonesLoading 
  } = useZoneStore();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch venues on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Load zones when venue is selected
  useEffect(() => {
    if (selectedVenue?._id) {
      fetchZonesByVenue(selectedVenue._id);
    }
  }, [selectedVenue]);

  const handleSaveZone = async (gridSelection) => {
    if (!currentZoneName.trim()) {
      setError("Please enter a zone name");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!gridSelection.start || !gridSelection.end) {
      setError("Please select a zone area on the grid");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Create zone via API
    const zoneData = {
      name: currentZoneName,
      grid_cells: gridSelection,
    };

    const result = await createZone(selectedVenue._id, zoneData);
    
    if (result.success) {
      setSuccess("Zone saved successfully!");
      setCurrentZoneName("");
      setIsDefiningZone(false);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.message || "Failed to save zone");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) {
      return;
    }

    const result = await deleteZone(selectedVenue._id, zoneId);
    
    if (result.success) {
      setSuccess("Zone deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.message || "Failed to delete zone");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Settings className="text-accent" size={32} />
                Admin Dashboard
              </h1>
              <p className="text-secondary">Define and manage zones for your venues</p>
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
            <AlertCircle className="text-green-500" size={20} />
            <p className="text-green-500">{success}</p>
          </div>
        )}

        {/* Venue Selector */}
        <div className="mb-6">
          <VenueSelector
            venues={venues && venues.length > 0 ? venues : MOCK_VENUES}
            selectedVenue={selectedVenue}
            onSelectVenue={setSelectedVenue}
            loading={venuesLoading}
          />
        </div>

        {selectedVenue && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone Definition Area */}
            <div className="lg:col-span-2">
              <div className="bg-surface rounded-lg p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Grid3x3 className="text-accent" size={24} />
                    Zone Definition
                  </h2>
                  {!isDefiningZone && (
                    <button
                      onClick={() => setIsDefiningZone(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      <Plus size={18} />
                      New Zone
                    </button>
                  )}
                </div>

                {isDefiningZone && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Zone Name</label>
                    <input
                      type="text"
                      value={currentZoneName}
                      onChange={(e) => setCurrentZoneName(e.target.value)}
                      placeholder="e.g., Stage Area, Food Court, Exit Gate"
                      className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                <ZoneDefinition
                  venue={selectedVenue}
                  zones={zones && zones.length > 0 ? zones : MOCK_ZONES[selectedVenue._id] || []}
                  isDefiningZone={isDefiningZone}
                  onSaveZone={handleSaveZone}
                  onCancelDefine={() => {
                    setIsDefiningZone(false);
                    setCurrentZoneName("");
                  }}
                  loading={zonesLoading}
                />
              </div>
            </div>

            {/* Zone List */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-lg p-6 border border-primary/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="text-accent" size={24} />
                  Defined Zones ({(zones && zones.length) || 0})
                </h2>
                <ZoneList
                  zones={zones && zones.length > 0 ? zones : MOCK_ZONES[selectedVenue._id] || []}
                  onDeleteZone={handleDeleteZone}
                  loading={zonesLoading}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedVenue && !venuesLoading && (
          <div className="text-center py-12 bg-surface rounded-lg border border-primary/20">
            <Grid3x3 className="mx-auto text-secondary mb-4" size={48} />
            <p className="text-secondary text-lg">Select a venue to start defining zones</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
