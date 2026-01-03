"""
Test captured JSON data with backend
=====================================
Sends metadata_output.json to backend one by one
"""

import socketio
import json
import time

# Use correct backend URL (port 5000)
BACKEND_URL = "http://localhost:5000"

def test_json_data():
    """Send captured JSON data to backend"""
    
    print("\n" + "="*70)
    print("TESTING JSON DATA WITH BACKEND")
    print("="*70)
    
    # Load JSON file
    print("\n📂 Loading metadata_output.json...")
    try:
        with open('metadata_output.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ metadata_output.json not found!")
        print("   Run demo.py first to generate it")
        return
    
    # Extract metadata array
    metadata_list = data.get('metadata', [])
    print(f"✓ Loaded {len(metadata_list)} metadata entries")
    print(f"  Camera ID: {data.get('camera_id')}")
    print(f"  Video Source: {data.get('video_source')}")
    
    # Connect to backend
    print(f"\n🔌 Connecting to backend at {BACKEND_URL}...")
    sio = socketio.Client()
    
    try:
        sio.connect(BACKEND_URL)
        print("✓ Connected to backend")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("   Make sure backend is running (npm start in server/)")
        return
    
    # Send each metadata entry
    print(f"\n📤 Sending {len(metadata_list)} metadata entries...")
    print("-"*70)
    
    for i, metadata in enumerate(metadata_list, 1):
        # Add detection_count if missing
        if 'detection_count' not in metadata:
            metadata['detection_count'] = len(metadata.get('detections', []))
        
        print(f"\n[{i}/{len(metadata_list)}] Sending metadata:")
        print(f"  Camera: {metadata['camera_id']}")
        print(f"  Frame: {metadata.get('frame_number')}")
        print(f"  Time: {metadata['timestamp']}")
        print(f"  Detections: {metadata['detection_count']}")
        
        # Send to backend
        sio.emit('camera_data', metadata)
        
        # Wait a bit between sends (simulate real-time)
        time.sleep(0.5)
    
    print("\n" + "="*70)
    print("✅ ALL METADATA SENT SUCCESSFULLY")
    print("="*70)
    print("\nCheck backend logs for processing results:")
    print("  - server/logs/combined.log")
    print("  - Terminal running npm start")
    
    # Disconnect
    time.sleep(1)
    sio.disconnect()
    print("\n✓ Disconnected from backend")

if __name__ == "__main__":
    try:
        test_json_data()
    except KeyboardInterrupt:
        print("\n\n⚠ Test stopped by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
