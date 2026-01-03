"""
System Test Script
==================
Tests each component individually before running the full system
"""

import sys
import time


def test_imports():
    """Test if all required packages are installed"""
    print("\n" + "="*60)
    print("TEST 1: Checking Package Imports")
    print("="*60)
    
    packages = [
        ("cv2", "OpenCV"),
        ("ultralytics", "YOLOv8"),
        ("socketio", "Python-SocketIO"),
    ]
    
    all_good = True
    for package, name in packages:
        try:
            __import__(package)
            print(f"✓ {name} installed")
        except ImportError:
            print(f"✗ {name} NOT installed")
            all_good = False
    
    return all_good


def test_config():
    """Test if config file is valid"""
    print("\n" + "="*60)
    print("TEST 2: Checking Configuration")
    print("="*60)
    
    try:
        from config import CAMERA_CONFIG, YOLO_CONFIG, WEBSOCKET_CONFIG
        
        print(f"✓ Config file loaded")
        print(f"  Camera ID: {CAMERA_CONFIG['camera_id']}")
        print(f"  Video Source: {CAMERA_CONFIG['source']}")
        print(f"  Resolution: {CAMERA_CONFIG['frame_width']}×{CAMERA_CONFIG['frame_height']}")
        print(f"  YOLO Model: {YOLO_CONFIG['model']}")
        print(f"  Backend URL: {WEBSOCKET_CONFIG['url']}")
        
        return True
    except Exception as e:
        print(f"✗ Config error: {e}")
        return False


def test_camera():
    """Test if camera can be opened"""
    print("\n" + "="*60)
    print("TEST 3: Testing Camera Access")
    print("="*60)
    
    try:
        from video_reader import VideoReader
        
        reader = VideoReader()
        frame, timestamp = reader.read_and_normalize()
        
        if frame is not None:
            print(f"✓ Camera working")
            print(f"  Frame shape: {frame.shape}")
            print(f"  Timestamp: {timestamp}")
            reader.release()
            return True
        else:
            print(f"✗ Could not read frame")
            reader.release()
            return False
            
    except Exception as e:
        print(f"✗ Camera error: {e}")
        return False


def test_detector():
    """Test if YOLOv8 detection works"""
    print("\n" + "="*60)
    print("TEST 4: Testing Person Detection")
    print("="*60)
    
    try:
        from detector import PersonDetector
        from video_reader import VideoReader
        
        detector = PersonDetector()
        reader = VideoReader()
        
        frame, _ = reader.read_and_normalize()
        
        if frame is not None:
            detections = detector.detect_people(frame)
            print(f"✓ Detection working")
            print(f"  People detected: {len(detections)}")
            
            if len(detections) > 0:
                print(f"  Sample detection: {detections[0]}")
            
            reader.release()
            return True
        else:
            print(f"✗ No frame to test")
            reader.release()
            return False
            
    except Exception as e:
        print(f"✗ Detection error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_metadata():
    """Test metadata builder"""
    print("\n" + "="*60)
    print("TEST 5: Testing Metadata Builder")
    print("="*60)
    
    try:
        from metadata_builder import MetadataBuilder
        from datetime import datetime
        
        builder = MetadataBuilder()
        
        # Mock detections
        detections = [
            {"x": 100, "y": 200, "w": 50, "h": 120},
            {"x": 300, "y": 150, "w": 55, "h": 130}
        ]
        timestamp = datetime.now().isoformat()
        
        metadata = builder.build(detections, timestamp)
        json_str = builder.to_json(metadata)
        
        print(f"✓ Metadata builder working")
        print(f"  Sample output: {json_str[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"✗ Metadata builder error: {e}")
        return False


def test_websocket():
    """Test WebSocket connection (optional - backend must be running)"""
    print("\n" + "="*60)
    print("TEST 6: Testing WebSocket Connection (Optional)")
    print("="*60)
    
    print("⚠ Skipping WebSocket test (backend may not be running)")
    print("  Run this after starting your Node.js backend:")
    print("  python websocket_streamer.py")
    
    return True  # Don't fail overall test if backend isn't running


def main():
    """Run all tests"""
    print("\n" + "#"*60)
    print("# CROWD MONITORING CV MODULE - SYSTEM TEST")
    print("#"*60)
    
    tests = [
        ("Imports", test_imports),
        ("Config", test_config),
        ("Camera", test_camera),
        ("Detector", test_detector),
        ("Metadata", test_metadata),
        ("WebSocket", test_websocket),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
            time.sleep(0.5)  # Brief pause between tests
        except KeyboardInterrupt:
            print("\n\n⚠ Tests interrupted by user")
            sys.exit(1)
        except Exception as e:
            print(f"\n✗ Unexpected error in {name}: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready.")
        print("\nNext step: Run 'python main.py' to start the CV module")
    else:
        print("\n⚠ Some tests failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("  - Install packages: pip install -r requirements.txt")
        print("  - Check camera connection")
        print("  - Verify config.py settings")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
