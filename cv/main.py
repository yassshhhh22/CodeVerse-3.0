"""
Main Application - Crowd Monitoring CV Module
==============================================
Orchestrates: Video Reading → Detection → Metadata Building → WebSocket Streaming
"""

import cv2
import time
import signal
import sys
import argparse

from config import CAMERA_CONFIG, LOGGING_CONFIG
from video_reader import VideoReader
from detector import PersonDetector
from metadata_builder import MetadataBuilder
from websocket_streamer import WebSocketStreamer


class CrowdMonitoringApp:
    """Main application class"""
    
    def __init__(self, video_source=None, camera_id=None):
        print("\n" + "="*60)
        print("CROWD MONITORING - COMPUTER VISION MODULE")
        print("="*60)
        
        # Override camera ID if provided
        if camera_id is not None:
            CAMERA_CONFIG["camera_id"] = camera_id
            print(f"Camera ID: {camera_id}")
        
        # Override video source if provided
        if video_source is not None:
            CAMERA_CONFIG["source"] = video_source
        
        print("\n[1/4] Initializing video reader...")
        self.video_reader = VideoReader()
        print("[2/4] Loading YOLOv8 model...")
        self.detector = PersonDetector()
        print("[3/4] Building metadata pipeline...")
        self.metadata_builder = MetadataBuilder()
        print("[4/4] Preparing WebSocket connection...")
        print("    (Venue will auto-register on first metadata send)")
        self.streamer = WebSocketStreamer()
        
        # Frame processing settings
        self.frame_skip = CAMERA_CONFIG["frame_skip"]
        self.frame_count = 0
        
        # Metadata sending interval (2 seconds)
        self.send_interval = 2.0
        self.last_send_time = 0
        self.latest_metadata = None
        
        # Performance tracking
        self.fps_tracker = {
            "start_time": time.time(),
            "frame_count": 0,
            "last_log_time": time.time()
        }
        
        # Statistics for aggregation
        self.interval_stats = {
            "total_detections": 0,
            "frame_count": 0,
            "max_people": 0,
            "min_people": float('inf')
        }
        
        # Graceful shutdown
        self.running = True
        signal.signal(signal.SIGINT, self._signal_handler)
        
        print(f"\nInitialization complete")
        print(f"  - Send interval: {self.send_interval}s")
        print(f"  - Press Ctrl+C to stop")
    
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
            print(f"\n[INFO] FPS: {fps:.2f}")
            
            # Reset
            self.fps_tracker["frame_count"] = 0
            self.fps_tracker["last_log_time"] = current_time
    
    def run(self):
        """Main processing loop"""
        
        # Connect to backend
        print("\n" + "-"*60)
        print("Connecting to backend...")
        if not self.streamer.connect():
            print("[ERROR] Backend connection failed. Exiting...")
            return
        
        print("-"*60)
        print("\nProcessing started\n")
        
        self.last_send_time = time.time()
        
        try:
            while self.running:
                # Read and normalize frame
                frame, timestamp = self.video_reader.read_and_normalize()
                
                if frame is None:
                    print("\n⚠ No frame available. End of video or camera disconnected.")
                    break
                
                # Frame sampling - skip frames to reduce processing load
                self.frame_count += 1
                if self.frame_count % self.frame_skip != 0:
                    continue
                
                # Detect people
                detections = self.detector.detect_people(frame)
                
                # Build metadata
                metadata = self.metadata_builder.build(detections, timestamp)
                
                # Update latest metadata (always keep most recent)
                self.latest_metadata = metadata
                
                # Update interval statistics
                num_people = len(detections)
                self.interval_stats["total_detections"] += num_people
                self.interval_stats["frame_count"] += 1
                self.interval_stats["max_people"] = max(self.interval_stats["max_people"], num_people)
                self.interval_stats["min_people"] = min(self.interval_stats["min_people"], num_people)
                
                # Check if it's time to send metadata
                current_time = time.time()
                if current_time - self.last_send_time >= self.send_interval:
                    self._send_aggregated_metadata()
                    self.last_send_time = current_time
                
                # Logging
                if LOGGING_CONFIG["log_detections"]:
                    time_since_send = current_time - self.last_send_time
                    print(f"Frame: {self.frame_count} | People: {len(detections)} | Next send: {self.send_interval - time_since_send:.1f}s", end="\r")
                
                # Update FPS
                self._update_fps()
        
        except KeyboardInterrupt:
            print("\n\n⚠ Interrupted by user")
        
        except Exception as e:
            print(f"\n❌ Error during processing: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Send final metadata if any
            if self.latest_metadata:
                print("\n📤 Sending final metadata...")
                self.streamer.send_metadata(self.latest_metadata)
            
            self._cleanup()
    
    def _send_aggregated_metadata(self):
        """Send latest metadata with interval statistics"""
        if not self.latest_metadata:
            return
        
        # Calculate aggregated stats
        avg_people = (self.interval_stats["total_detections"] / 
                     self.interval_stats["frame_count"]) if self.interval_stats["frame_count"] > 0 else 0
        
        # Add interval stats to metadata
        enriched_metadata = self.latest_metadata.copy()
        enriched_metadata["interval_stats"] = {
            "avg_people": round(avg_people, 2),
            "max_people": self.interval_stats["max_people"],
            "min_people": self.interval_stats["min_people"] if self.interval_stats["min_people"] != float('inf') else 0,
            "interval_seconds": self.send_interval
        }
        
        # Send to backend
        success = self.streamer.send_metadata(enriched_metadata)
        
        if success:
            print(f"\n[SENT] People: {enriched_metadata['detection_count']} | Avg: {avg_people:.1f} | Max: {self.interval_stats['max_people']} | Min: {enriched_metadata['interval_stats']['min_people']}")
        
        # Reset interval stats
        self.interval_stats = {
            "total_detections": 0,
            "frame_count": 0,
            "max_people": 0,
            "min_people": float('inf')
        }
    
    def _cleanup(self):
        """Release all resources"""
        print("\n\n" + "="*60)
        print("STOPPING")
        print("="*60)
        
        self.video_reader.release()
        self.streamer.disconnect()
        cv2.destroyAllWindows()
        
        # Final stats
        total_time = time.time() - self.fps_tracker["start_time"]
        avg_fps = self.frame_count / total_time if total_time > 0 else 0
        
        print(f"\nSession Summary:")
        print(f"  - Frames processed: {self.frame_count}")
        print(f"  - Duration: {total_time:.1f}s")
        print(f"  - Average FPS: {avg_fps:.1f}")
        print("\nShutdown complete\n")


def parse_arguments():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(
        description='Crowd Monitoring CV Module - Person Detection & Tracking',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                                    # Use webcam (default)
  python main.py --camera 0 --id CAM_01            # Laptop camera with custom ID
  python main.py --camera 1 --id CAM_USB           # USB camera with custom ID
  python main.py --video video.mp4                 # Use video file
  python main.py --rtsp "http://192.168.1.100:8080/video" --id PHONE_01  # Phone camera
        """
    )
    
    source_group = parser.add_mutually_exclusive_group()
    source_group.add_argument(
        '--video', '-v',
        type=str,
        help='Path to video file (e.g., video.mp4, recordings/crowd.avi)'
    )
    source_group.add_argument(
        '--camera', '-c',
        type=int,
        help='Camera index (e.g., 0 for default, 1 for second camera)'
    )
    source_group.add_argument(
        '--rtsp', '-r',
        type=str,
        help='RTSP/HTTP stream URL for IP camera (e.g., http://192.168.1.100:8080/video)'
    )
    
    parser.add_argument(
        '--id',
        type=str,
        help='Unique camera ID (e.g., CAM_01, PHONE_01). Overrides config.py setting.'
    )
    
    return parser.parse_args()


if __name__ == "__main__":
    # Parse command-line arguments
    args = parse_arguments()
    
    # Determine video source
    video_source = None
    if args.video:
        video_source = args.video
        print(f"\n📹 Using video file: {video_source}")
    elif args.camera is not None:
        video_source = args.camera
        print(f"\n📷 Using camera index: {video_source}")
    elif args.rtsp:
        video_source = args.rtsp
        print(f"\n📡 Using HTTP/RTSP stream: {video_source}")
    else:
        print(f"\n📷 Using default camera (config.py setting)")
    
    # Get camera ID
    camera_id = args.id if args.id else None
    
    # Run application
    app = CrowdMonitoringApp(video_source=video_source, camera_id=camera_id)
    app.run()

