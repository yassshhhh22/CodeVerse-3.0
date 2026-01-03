"""
Demo Mode - Shows Metadata Output
==================================
Runs detection and prints metadata to console without needing backend
"""

import cv2
import time
from datetime import datetime
import json

from config import CAMERA_CONFIG
from video_reader import VideoReader
from detector import PersonDetector
from metadata_builder import MetadataBuilder


def demo_mode(duration_seconds=30):
    """
    Run in demo mode - show metadata output without backend
    
    Args:
        duration_seconds: How long to run demo (default 30s)
    """
    print("\n" + "="*70)
    print("🎬 DEMO MODE - Metadata Output Preview")
    print("="*70)
    print(f"\nRunning for {duration_seconds} seconds...")
    print("Press Ctrl+C to stop early\n")
    print("-"*70)
    
    # Initialize components
    reader = VideoReader()
    detector = PersonDetector()
    builder = MetadataBuilder()
    
    start_time = time.time()
    frame_count = 0
    total_detections = 0
    
    try:
        while (time.time() - start_time) < duration_seconds:
            # Read frame
            frame, timestamp = reader.read_and_normalize()
            
            if frame is None:
                print("⚠ Camera disconnected")
                break
            
            frame_count += 1
            
            # Skip frames for performance
            if frame_count % 3 != 0:
                continue
            
            # Detect people
            detections = detector.detect_people(frame)
            total_detections += len(detections)
            
            # Build metadata
            metadata = builder.build(detections, timestamp)
            
            # Print metadata (pretty formatted)
            print(f"\n📹 Frame {frame_count} @ {timestamp.split('T')[1][:12]}")
            print(f"   👥 People detected: {len(detections)}")
            
            if len(detections) > 0:
                print("   📦 Metadata:")
                print(json.dumps(metadata, indent=2))
            else:
                print("   ℹ️  No people detected")
            
            print("-"*70)
            
            # Small delay
            time.sleep(0.5)
    
    except KeyboardInterrupt:
        print("\n\n⚠ Demo stopped by user")
    
    finally:
        reader.release()
        
        # Stats
        elapsed = time.time() - start_time
        avg_fps = frame_count / elapsed if elapsed > 0 else 0
        avg_people = total_detections / (frame_count / 3) if frame_count > 0 else 0
        
        print("\n" + "="*70)
        print("📊 Demo Statistics")
        print("="*70)
        print(f"Duration: {elapsed:.2f}s")
        print(f"Frames processed: {frame_count}")
        print(f"Average FPS: {avg_fps:.2f}")
        print(f"Total detections: {total_detections}")
        print(f"Average people per frame: {avg_people:.1f}")
        print("\n✅ Demo complete\n")


if __name__ == "__main__":
    import sys
    
    # Optional: Pass duration as argument
    duration = 30
    if len(sys.argv) > 1:
        try:
            duration = int(sys.argv[1])
        except ValueError:
            print("Usage: python demo.py [duration_seconds]")
            sys.exit(1)
    
    demo_mode(duration)
