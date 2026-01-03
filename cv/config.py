"""
Configuration file for CV module
==================================
All camera, model, and connection settings in one place
"""

# =====================================
# CAMERA CONFIGURATION
# =====================================
CAMERA_CONFIG = {
    # Camera identification
    "camera_id": "CAM_01",
    
    # Video source - can be:
    # - 0 for default webcam
    # - 1, 2, etc. for other cameras
    # - "video.mp4" for video file in cv/ folder
    # - "path/to/video.mp4" for video file with full path
    # - "rtsp://..." for IP camera
    "source": 0,  # Default: webcam. For video file, use: "video.mp4"
    
    # Fixed resolution (all frames resized to this)
    "frame_width": 1280,
    "frame_height": 720,
    
    # Frame sampling rate
    # Send 1 out of every N frames (reduces backend load)
    "frame_skip": 2  # Process every 2nd frame
}

# =====================================
# YOLO MODEL CONFIGURATION
# =====================================
YOLO_CONFIG = {
    # Model variant
    # Options: yolov8n.pt (fastest), yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt (most accurate)
    "model": "yolov8n.pt",  # Nano model - good for real-time
    
    # Confidence threshold (0.0 to 1.0)
    # Higher = fewer false positives, but might miss some people
    "confidence": 0.4,
    
    # Class ID for person in COCO dataset
    "person_class_id": 0
}

# =====================================
# WEBSOCKET CONFIGURATION
# =====================================
WEBSOCKET_CONFIG = {
    # Backend WebSocket endpoint
    "url": "ws://localhost:3000/camera-stream",  # Update with your backend URL
    
    # Reconnection settings
    "reconnect_interval": 5,  # seconds
    "max_retries": 5
}

# =====================================
# LOGGING CONFIGURATION
# =====================================
LOGGING_CONFIG = {
    "enabled": True,
    "log_detections": True,  # Print detection count per frame
    "log_fps": True,  # Show FPS stats every N seconds
    "fps_interval": 5  # Log FPS every 5 seconds
}
