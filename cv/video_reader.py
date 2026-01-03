import cv2
from config import CAMERA_CONFIG
from datetime import datetime


class VideoReader:
    """Reads video frames and normalizes them"""
    
    def __init__(self):
        self.camera_id = CAMERA_CONFIG["camera_id"]
        self.source = CAMERA_CONFIG["source"]
        self.target_width = CAMERA_CONFIG["frame_width"]
        self.target_height = CAMERA_CONFIG["frame_height"]
        
        # Open video source
        self.cap = cv2.VideoCapture(self.source)
        
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video source: {self.source}")
        
        print(f"✓ Camera opened: {self.camera_id}")
        print(f"  Target resolution: {self.target_width}×{self.target_height}")
    
    def read_and_normalize(self):
        """
        Read one frame and normalize it
        
        Returns:
            (frame, timestamp) or (None, None) if no frame available
        """
        ret, frame = self.cap.read()
        
        if not ret:
            return None, None
        
        # Resize to fixed resolution
        normalized_frame = cv2.resize(frame, (self.target_width, self.target_height))
        
        # Get current timestamp
        timestamp = datetime.now().isoformat()
        
        return normalized_frame, timestamp
    
    def release(self):
        """Release camera resources"""
        self.cap.release()
        print("✓ Camera released")


# Simple test
if __name__ == "__main__":
    reader = VideoReader()
    
    print("\nReading 5 frames...")
    for i in range(5):
        frame, ts = reader.read_and_normalize()
        if frame is not None:
            print(f"  Frame {i+1}: {ts} | Shape: {frame.shape}")
        else:
            print(f"  Frame {i+1}: FAILED")
    
    reader.release()
    print("\n✓ Test complete")
