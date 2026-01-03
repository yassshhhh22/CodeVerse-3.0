"""
Visual Camera Test
==================
Shows live camera feed with bounding boxes drawn around detected people.
Perfect for verifying camera setup and detection accuracy.
"""

import cv2
import time
from datetime import datetime

from config import CAMERA_CONFIG, YOLO_CONFIG
from video_reader import VideoReader
from detector import PersonDetector


class VisualTest:
    """Visual test with live camera feed and detection boxes"""
    
    def __init__(self):
        print("\n" + "="*70)
        print("📹 VISUAL CAMERA TEST")
        print("="*70)
        print("\nThis will show your camera feed with detection boxes.")
        print("Press 'q' to quit, 's' to save a screenshot\n")
        
        # Initialize components
        self.reader = VideoReader()
        self.detector = PersonDetector()
        
        # Stats
        self.frame_count = 0
        self.detection_count = 0
        self.start_time = time.time()
        
        # Colors (BGR format)
        self.colors = {
            'box': (0, 255, 0),      # Green boxes
            'text': (255, 255, 255),  # White text
            'bg': (0, 0, 0)           # Black background for text
        }
    
    def draw_detection_box(self, frame, detection):
        """Draw a bounding box with label"""
        x, y, w, h = detection['x'], detection['y'], detection['w'], detection['h']
        
        # Draw rectangle
        cv2.rectangle(frame, (x, y), (x + w, y + h), self.colors['box'], 2)
        
        # Draw label background
        label = f"Person"
        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
        cv2.rectangle(frame, (x, y - 20), (x + label_size[0], y), self.colors['box'], -1)
        
        # Draw label text
        cv2.putText(frame, label, (x, y - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, self.colors['text'], 1)
    
    def draw_info_panel(self, frame, num_detections):
        """Draw information panel at top of frame"""
        # Calculate stats
        elapsed = time.time() - self.start_time
        fps = self.frame_count / elapsed if elapsed > 0 else 0
        
        # Info lines
        info_lines = [
            f"FPS: {fps:.1f}",
            f"People: {num_detections}",
            f"Total Detected: {self.detection_count}",
            f"Resolution: {CAMERA_CONFIG['frame_width']}x{CAMERA_CONFIG['frame_height']}",
            f"Model: {YOLO_CONFIG['model']}",
            "Press 'q' to quit, 's' to screenshot"
        ]
        
        # Draw semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (frame.shape[1], 150), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Draw text
        y_offset = 25
        for line in info_lines:
            cv2.putText(frame, line, (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.colors['text'], 2)
            y_offset += 20
    
    def save_screenshot(self, frame):
        """Save current frame as screenshot"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"screenshot_{timestamp}.jpg"
        cv2.imwrite(filename, frame)
        print(f"\n📸 Screenshot saved: {filename}")
    
    def run(self):
        """Main test loop"""
        print("Starting visual test...\n")
        
        try:
            while True:
                # Read frame
                frame, timestamp = self.reader.read_and_normalize()
                
                if frame is None:
                    print("❌ Failed to read frame")
                    break
                
                self.frame_count += 1
                
                # Detect people
                detections = self.detector.detect_people(frame)
                self.detection_count += len(detections)
                
                # Draw detection boxes
                for detection in detections:
                    self.draw_detection_box(frame, detection)
                
                # Draw info panel
                self.draw_info_panel(frame, len(detections))
                
                # Show frame
                cv2.imshow('Crowd Monitoring - Visual Test', frame)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord('q'):
                    print("\n👋 Quitting...")
                    break
                elif key == ord('s'):
                    self.save_screenshot(frame)
        
        except KeyboardInterrupt:
            print("\n\n⚠ Test stopped by user")
        
        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        self.reader.release()
        cv2.destroyAllWindows()
        
        # Print final stats
        elapsed = time.time() - self.start_time
        avg_fps = self.frame_count / elapsed if elapsed > 0 else 0
        
        print("\n" + "="*70)
        print("📊 Test Summary")
        print("="*70)
        print(f"Duration: {elapsed:.2f}s")
        print(f"Frames: {self.frame_count}")
        print(f"Average FPS: {avg_fps:.2f}")
        print(f"Total Detections: {self.detection_count}")
        print("\n✅ Visual test complete\n")


if __name__ == "__main__":
    tester = VisualTest()
    tester.run()
