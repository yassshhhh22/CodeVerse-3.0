"""
Auto-Registration Module
=========================
Automatically registers camera as venue in MongoDB when CV starts
"""

import requests
import json
from config import CAMERA_CONFIG, WEBSOCKET_CONFIG


class VenueRegistration:
    """Handles automatic venue/camera registration with backend"""
    
    def __init__(self):
        # Extract backend URL from websocket config
        ws_url = WEBSOCKET_CONFIG["url"]
        # Convert ws://localhost:5000 to http://localhost:5000
        self.backend_url = ws_url.replace("ws://", "http://").replace("wss://", "https://")
        self.camera_id = CAMERA_CONFIG["camera_id"]
        self.frame_width = CAMERA_CONFIG["frame_width"]
        self.frame_height = CAMERA_CONFIG["frame_height"]
    
    def register_venue(self):
        """
        Register this camera as a venue in the backend
        If venue already exists, it will be updated
        """
        print("\n[AUTO-REGISTER] Checking venue registration...")
        
        venue_data = {
            "camera_id": self.camera_id,
            "name": f"Camera {self.camera_id}",
            "frame_width": self.frame_width,
            "frame_height": self.frame_height,
            "grid_rows": 50,  # Standard 50x50 grid
            "grid_cols": 50,
            "status": "active"
        }
        
        try:
            # Try to create/update venue
            response = requests.post(
                f"{self.backend_url}/api/venues/auto-register",
                json=venue_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✓ Venue registered: {result.get('data', {}).get('name', self.camera_id)}")
                return True
            else:
                print(f"⚠ Registration returned status {response.status_code}")
                print(f"  Response: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"✗ Cannot connect to backend at {self.backend_url}")
            print("  Make sure the server is running!")
            return False
        except Exception as e:
            print(f"✗ Registration failed: {e}")
            return False


# Test the registration
if __name__ == "__main__":
    registrar = VenueRegistration()
    success = registrar.register_venue()
    print(f"\nRegistration {'successful' if success else 'failed'}!")
