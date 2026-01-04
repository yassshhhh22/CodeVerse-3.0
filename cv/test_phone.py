import cv2

url = 'http://192.168.63.145:8080/video'
print(f"\nTesting phone camera at: {url}\n")

cap = cv2.VideoCapture(url)

if cap.isOpened():
    ret, frame = cap.read()
    if ret:
        h, w = frame.shape[:2]
        print(f"✓ SUCCESS! Phone camera connected")
        print(f"  Resolution: {w}x{h}")
        print(f"\nReady to use! Run: python main.py")
    else:
        print("✗ Connected but no frames received")
    cap.release()
else:
    print("✗ FAILED to connect")
    print("\nTroubleshooting:")
    print("- Make sure IP Webcam app is running")
    print("- Check phone and PC are on same WiFi")
    print("- Verify IP: http://192.168.63.145:8080")
    print("- Try disabling Windows Firewall")
