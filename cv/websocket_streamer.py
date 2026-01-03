"""
WebSocket Streamer Module
==========================
Sends metadata to Node.js backend in real-time
"""

import socketio
import time
from config import WEBSOCKET_CONFIG


class WebSocketStreamer:
    """Streams metadata to backend via WebSocket"""
    
    def __init__(self):
        self.url = WEBSOCKET_CONFIG["url"]
        self.reconnect_interval = WEBSOCKET_CONFIG["reconnect_interval"]
        self.max_retries = WEBSOCKET_CONFIG["max_retries"]
        
        # Create SocketIO client
        self.sio = socketio.Client()
        
        # Register event handlers
        self._register_handlers()
        
        # Connection state
        self.connected = False
        self.retry_count = 0
    
    def _register_handlers(self):
        """Register WebSocket event handlers"""
        
        @self.sio.on('connect')
        def on_connect():
            self.connected = True
            self.retry_count = 0
            print("✓ Connected to backend")
        
        @self.sio.on('disconnect')
        def on_disconnect():
            self.connected = False
            print("✗ Disconnected from backend")
        
        @self.sio.on('error')
        def on_error(data):
            print(f"✗ WebSocket error: {data}")
    
    def connect(self):
        """Connect to backend with retry logic"""
        while self.retry_count < self.max_retries:
            try:
                print(f"Connecting to {self.url}...")
                self.sio.connect(self.url)
                return True
            except Exception as e:
                self.retry_count += 1
                print(f"✗ Connection failed (attempt {self.retry_count}/{self.max_retries}): {e}")
                
                if self.retry_count < self.max_retries:
                    print(f"  Retrying in {self.reconnect_interval} seconds...")
                    time.sleep(self.reconnect_interval)
        
        print("✗ Max retries reached. Could not connect to backend.")
        return False
    
    def send_metadata(self, metadata):
        """
        Send metadata to backend
        
        Args:
            metadata: Dictionary with camera_id, detections, timestamp
        """
        if not self.connected:
            print("⚠ Not connected. Skipping frame...")
            return False
        
        try:
            # Emit metadata to backend
            self.sio.emit('camera_data', metadata)
            return True
        except Exception as e:
            print(f"✗ Failed to send metadata: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from backend"""
        if self.connected:
            self.sio.disconnect()
            print("✓ Disconnected from backend")


# Simple test
if __name__ == "__main__":
    streamer = WebSocketStreamer()
    
    if streamer.connect():
        # Test metadata
        test_data = {
            "camera_id": "CAM_01",
            "detections": [
                {"x": 100, "y": 200, "w": 50, "h": 120}
            ],
            "timestamp": "2026-01-03T10:30:00.000Z",
            "detection_count": 1
        }
        
        print("Sending test metadata...")
        streamer.send_metadata(test_data)
        
        time.sleep(2)
        streamer.disconnect()
