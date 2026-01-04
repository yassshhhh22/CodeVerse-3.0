"""
Quick Camera Finder
===================
Run this to find all available cameras on your system
"""

import cv2

def find_cameras():
    """Test camera indices 0-10 to find available cameras"""
    print("\n🎥 Searching for available cameras...\n")
    
    available_cameras = []
    
    for i in range(10):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                height, width = frame.shape[:2]
                available_cameras.append({
                    'index': i,
                    'resolution': f"{width}x{height}"
                })
                print(f"✓ Camera {i}: Available ({width}x{height})")
            cap.release()
    
    if not available_cameras:
        print("❌ No cameras found!")
        print("\nTroubleshooting:")
        print("- Check if camera is connected")
        print("- Try running as administrator")
        print("- Close other apps using the camera")
    else:
        print(f"\n✓ Found {len(available_cameras)} camera(s)")
        print("\nTo use in config.py:")
        for cam in available_cameras:
            print(f'  "source": {cam["index"]}  # {cam["resolution"]}')
    
    return available_cameras

def test_ip_camera(url):
    """Test if IP camera URL works"""
    print(f"\n🌐 Testing IP camera: {url}\n")
    
    cap = cv2.VideoCapture(url)
    
    if not cap.isOpened():
        print("❌ Failed to connect!")
        print("\nTroubleshooting:")
        print("- Check phone and PC are on same WiFi")
        print("- Verify IP address is correct")
        print("- Make sure /video is at the end of URL")
        print("- Try disabling Windows Firewall")
        return False
    
    ret, frame = cap.read()
    if not ret:
        print("❌ Connected but no frames received!")
        cap.release()
        return False
    
    height, width = frame.shape[:2]
    print(f"✓ Connection successful!")
    print(f"  Resolution: {width}x{height}")
    print(f"\nTo use in config.py:")
    print(f'  "source": "{url}"')
    
    cap.release()
    return True

if __name__ == "__main__":
    print("="*50)
    print("       CAMERA FINDER UTILITY")
    print("="*50)
    
    # Find local cameras
    cameras = find_cameras()
    
    # Ask if user wants to test IP camera
    print("\n" + "="*50)
    test_ip = input("\nDo you want to test an IP camera URL? (y/n): ").strip().lower()
    
    if test_ip == 'y':
        url = input("Enter IP Webcam URL (e.g., http://192.168.1.100:8080/video): ").strip()
        if url:
            test_ip_camera(url)
    
    print("\n" + "="*50)
    print("Done! Update config.py with your chosen source.")
    print("="*50)
