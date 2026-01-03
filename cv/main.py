"""
Main Application - Crowd Monitoring CV Module
==============================================
Orchestrates: Video Reading → Detection → Metadata Building → WebSocket Streaming
"""

import cv2
import time
import signal
import sys

from config import CAMERA_CONFIG, LOGGING_CONFIG
from video_reader import VideoReader
from detector import PersonDetector
from metadata_builder import MetadataBuilder
from websocket_streamer import WebSocketStreamer


class CrowdMonitoringApp:
    """Main application class"""
    
    def __init__(self):
        print("\n" + "="*60)
        print("🎥 CROWD MONITORING - COMPUTER VISION MODULE")
        print("="*60 + "\n")
        
        # Initialize components
        print("Initializing components...")
        
        self.video_reader = VideoReader()
        self.detector = PersonDetector()
        self.metadata_builder = MetadataBuilder()
        self.streamer = WebSocketStreamer()
        
        # Frame processing settings
        self.frame_skip = CAMERA_CONFIG["frame_skip"]
        self.frame_count = 0
        
        # Performance tracking
        self.fps_tracker = {
            "start_time": time.time(),
            "frame_count": 0,
            "last_log_time": time.time()
        }
        
        # Graceful shutdown
        self.running = True
        signal.signal(signal.SIGINT, self._signal_handler)
        
        print("\n✓ All components initialized")
    
    def _signal_handler(self, sig, frame):
        """Handle Ctrl+C gracefully"""
        print("\n\n🛑 Shutdown signal received...")
        self.running = False
    
    def _update_fps(self):
        """Track and log FPS"""
        self.fps_tracker["frame_count"] += 1
        
        if not LOGGING_CONFIG["log_fps"]:
            return
        
        current_time = time.time()
        elapsed = current_time - self.fps_tracker["last_log_time"]
        
        if elapsed >= LOGGING_CONFIG["fps_interval"]:
            fps = self.fps_tracker["frame_count"] / elapsed
            print(f"\n📊 FPS: {fps:.2f}")
            
            # Reset
            self.fps_tracker["frame_count"] = 0
            self.fps_tracker["last_log_time"] = current_time
    
    def run(self):
        """Main processing loop"""
        
        # Connect to backend
        print("\n" + "-"*60)
        if not self.streamer.connect():
            print("❌ Could not connect to backend. Exiting...")
            return
        
        print("-"*60)
        print("\n🚀 Starting video processing...\n")
        
        try:
            while self.running:
                # Read and normalize frame
                frame, timestamp = self.video_reader.read_and_normalize()
                
                if frame is None:
                    print("⚠ No frame available. End of video or camera disconnected.")
                    break
                
                # Frame sampling - skip frames to reduce processing load
                self.frame_count += 1
                if self.frame_count % self.frame_skip != 0:
                    continue
                
                # Detect people
                detections = self.detector.detect_people(frame)
                
                # Build metadata
                metadata = self.metadata_builder.build(detections, timestamp)
                
                # Send to backend
                self.streamer.send_metadata(metadata)
                
                # Logging
                if LOGGING_CONFIG["log_detections"]:
                    print(f"Frame {self.frame_count} | Detected: {len(detections)} people", end="\r")
                
                # Update FPS
                self._update_fps()
                
                # Optional: Display frame (for debugging)
                # Uncomment below to show video with bounding boxes
                """
                for det in detections:
                    x, y, w, h = det["x"], det["y"], det["w"], det["h"]
                    cv2.rectangle(frame, (int(x), int(y)), (int(x+w), int(y+h)), (0, 255, 0), 2)
                
                cv2.imshow("Crowd Monitoring", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                """
        
        except Exception as e:
            print(f"\n❌ Error during processing: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            self._cleanup()
    
    def _cleanup(self):
        """Release all resources"""
        print("\n\n" + "="*60)
        print("🧹 Cleaning up...")
        print("="*60)
        
        self.video_reader.release()
        self.streamer.disconnect()
        cv2.destroyAllWindows()
        
        # Final stats
        total_time = time.time() - self.fps_tracker["start_time"]
        avg_fps = self.frame_count / total_time if total_time > 0 else 0
        
        print(f"\n📈 Session Stats:")
        print(f"  Total frames processed: {self.frame_count}")
        print(f"  Total time: {total_time:.2f}s")
        print(f"  Average FPS: {avg_fps:.2f}")
        print("\n✅ Shutdown complete\n")


# =====================================
# ENTRY POINT
# =====================================
if __name__ == "__main__":
    app = CrowdMonitoringApp()
    app.run()
