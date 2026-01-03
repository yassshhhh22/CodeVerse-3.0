"""
Metadata Builder Module
Responsibility: Create JSON payload with detections
"""

import json
from config import CAMERA_CONFIG


class MetadataBuilder:
    """Builds metadata payload"""
    
    def __init__(self):
        self.camera_id = CAMERA_CONFIG["camera_id"]
        self.frame_width = CAMERA_CONFIG["frame_width"]
        self.frame_height = CAMERA_CONFIG["frame_height"]
    
    def build(self, detections, timestamp):
        """
        Build metadata JSON
        
        Args:
            detections: List of dicts [{"x": ..., "y": ..., "w": ..., "h": ...}]
            timestamp: ISO format timestamp
        
        Returns:
            dict: Complete metadata payload
        """
        metadata = {
            "camera_id": self.camera_id,
            "detections": detections,
            "timestamp": timestamp,
            "detection_count": len(detections),
            "frame_width": self.frame_width,
            "frame_height": self.frame_height
        }
        
        return metadata
    
    def to_json(self, metadata):
        """Convert metadata to JSON string"""
        return json.dumps(metadata)


# Simple test
if __name__ == "__main__":
    builder = MetadataBuilder()
    
    # Mock data
    detections = [
        {"x": 620, "y": 340, "w": 60, "h": 150},
        {"x": 210, "y": 400, "w": 55, "h": 140}
    ]
    timestamp = "2026-01-03T10:30:45.123456"
    
    metadata = builder.build(detections, timestamp)
    json_str = builder.to_json(metadata)
    
    print("Generated metadata:")
    print(json.dumps(metadata, indent=2))
    print("\nJSON string:")
    print(json_str)
