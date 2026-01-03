"""
YOLOv8 Detector Module
Responsibility: Detect people in frames, extract bounding boxes
"""

from ultralytics import YOLO
from config import YOLO_CONFIG, CAMERA_CONFIG


class PersonDetector:
    """Detects people using YOLOv8"""
    
    def __init__(self):
        self.model_name = YOLO_CONFIG["model"]
        self.confidence = YOLO_CONFIG["confidence"]
        self.person_class_id = YOLO_CONFIG["person_class_id"]
        
        # Load YOLOv8 model
        print(f"Loading YOLOv8 model: {self.model_name}...")
        self.model = YOLO(self.model_name)
        print(f"✓ Model loaded")
    
    def detect_people(self, frame):
        """
        Detect people in a frame
        
        Args:
            frame: Normalized frame (1280×720)
        
        Returns:
            List of detections: [{"x": ..., "y": ..., "w": ..., "h": ...}, ...]
        """
        # Run inference
        results = self.model.predict(
            frame,
            conf=self.confidence,
            classes=[self.person_class_id],  # Only detect people
            verbose=False
        )
        
        detections = []
        
        if results and len(results) > 0:
            boxes = results[0].boxes  # Get bounding boxes
            
            for box in boxes:
                # Extract coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Convert to (x, y, width, height)
                x = int(x1)
                y = int(y1)
                w = int(x2 - x1)
                h = int(y2 - y1)
                
                detections.append({
                    "x": x,
                    "y": y,
                    "w": w,
                    "h": h
                })
        
        return detections


# Simple test
if __name__ == "__main__":
    import cv2
    from video_reader import VideoReader
    
    detector = PersonDetector()
    reader = VideoReader()
    
    print("\nDetecting people in 5 frames...")
    for i in range(5):
        frame, ts = reader.read_and_normalize()
        if frame is not None:
            detections = detector.detect_people(frame)
            print(f"  Frame {i+1}: {len(detections)} people detected")
            for j, det in enumerate(detections):
                print(f"    Person {j+1}: x={det['x']}, y={det['y']}, w={det['w']}, h={det['h']}")
        else:
            print(f"  Frame {i+1}: FAILED")
    
    reader.release()
    print("\n✓ Test complete")
