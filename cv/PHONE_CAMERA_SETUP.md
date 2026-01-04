# 📱 Using Phone Camera for Testing

You can use your phone camera instead of or alongside your PC camera! Here are the methods:

---

## Method 1: IP Webcam (Android) - **RECOMMENDED** ✅

### Step 1: Install IP Webcam App
1. Download **IP Webcam** from Google Play Store (FREE)
2. Open the app

### Step 2: Configure & Start Server
1. Scroll down to **"Video preferences"**
   - Set **Resolution** to 1280x720 or 1920x1080
   - Set **Quality** to 70-80%
   - Set **FPS limit** to 30
2. Scroll to bottom and tap **"Start server"**
3. **Note the URL** shown (e.g., `http://192.168.1.100:8080`)

### Step 3: Update CV Config
In `cv/config.py`, change the `source`:

```python
CAMERA_CONFIG = {
    "camera_id": "PHONE_01",  # Change ID
    "source": "http://192.168.1.100:8080/video",  # Add /video at end
    "frame_width": 1280,
    "frame_height": 720,
    "frame_skip": 2
}
```

### Step 4: Run CV System
```bash
cd cv
python main.py
```

✅ **That's it!** Your phone is now streaming to the system.

---

## Method 2: DroidCam (Android/iOS)

### Step 1: Install DroidCam
- **Android**: Download from Play Store
- **iOS**: Download from App Store
- **PC**: Download DroidCam Client from [www.dev47apps.com](https://www.dev47apps.com)

### Step 2: Connect
1. Open DroidCam on phone
2. Open DroidCam Client on PC
3. Connect via WiFi (enter IP shown on phone)
4. Click **Start**

### Step 3: Use as Webcam
DroidCam creates a virtual webcam. In `config.py`:

```python
CAMERA_CONFIG = {
    "camera_id": "DROIDCAM_01",
    "source": 1,  # Or 2, 3 depending on which camera index DroidCam uses
    "frame_width": 1280,
    "frame_height": 720,
    "frame_skip": 2
}
```

---

## Method 3: EpocCam (iOS) - **FOR iPHONE**

### Step 1: Install EpocCam
- **iPhone**: Download from App Store
- **PC**: Download EpocCam Drivers from [www.kinoni.com](https://www.kinoni.com)

### Step 2: Connect
1. Connect iPhone and PC to same WiFi
2. Open EpocCam on iPhone
3. PC will automatically detect it as webcam

### Step 3: Use as Webcam
In `config.py`:

```python
CAMERA_CONFIG = {
    "camera_id": "IPHONE_01",
    "source": 1,  # Or 2, 3 depending on camera index
    "frame_width": 1280,
    "frame_height": 720,
    "frame_skip": 2
}
```

---

## Using BOTH Phone AND PC Camera Simultaneously 🎥🎥

You can run multiple CV instances! Here's how:

### Option A: Multiple Config Files

1. **Create `config_pc.py`** (copy from `config.py`):
```python
CAMERA_CONFIG = {
    "camera_id": "PC_CAM_01",
    "source": 0,  # PC webcam
    "frame_width": 1280,
    "frame_height": 720,
    "frame_skip": 2
}
```

2. **Create `config_phone.py`**:
```python
CAMERA_CONFIG = {
    "camera_id": "PHONE_01",
    "source": "http://192.168.1.100:8080/video",  # IP Webcam URL
    "frame_width": 1280,
    "frame_height": 720,
    "frame_skip": 2
}
```

3. **Modify `main.py`** to accept config parameter:
```python
import sys
if len(sys.argv) > 1 and sys.argv[1] == 'phone':
    import config_phone as config
else:
    import config_pc as config
```

4. **Run both**:
```bash
# Terminal 1 - PC Camera
python main.py

# Terminal 2 - Phone Camera
python main.py phone
```

### Option B: Command Line Argument (EASIER)

I can modify the code to accept camera source as argument!

---

## Troubleshooting 🔧

### "Failed to open video source"
- ✅ Check phone and PC are on **same WiFi network**
- ✅ Verify IP address is correct (check phone app)
- ✅ Try pinging the IP: `ping 192.168.1.100`
- ✅ Disable Windows Firewall temporarily
- ✅ Make sure `/video` is added to URL for IP Webcam

### Low FPS / Lag
- Reduce resolution in phone app to 640x480
- Increase `frame_skip` to 3 or 4 in config
- Move closer to WiFi router
- Close other apps on phone

### Wrong Camera Index (DroidCam/EpocCam)
Try different numbers:
```python
"source": 0  # PC webcam
"source": 1  # First virtual camera
"source": 2  # Second virtual camera
```

Run this to find available cameras:
```python
import cv2
for i in range(5):
    cap = cv2.VideoCapture(i)
    if cap.isOpened():
        print(f"Camera {i}: Available")
        cap.release()
```

---

## Quick Test 🧪

After configuring, test with:
```bash
cd cv
python test_system.py
```

You should see detection boxes on people!

---

## Best Practice for Testing 📝

1. **Start with IP Webcam** - Most reliable and flexible
2. **Use WiFi 5GHz** if available (less interference)
3. **Keep phone charged** or connected to power
4. **Position phone at eye level** for better detection
5. **Good lighting** improves detection accuracy

---

Need help? Check the main `README.md` or run tests with `python test_system.py`
