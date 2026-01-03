# 🎯 MASTER TEST GUIDE

**One guide for all testing needs. Everything you need is here.**

---

## 🚀 QUICK START

### First Time Setup (Once)

```bash
cd cv
setup_venv.bat
```

### Test It Works

```bash
test.bat
```

---

## 📹 RUN OPTIONS

### 1️⃣ Full System (Webcam → Backend)

**Use when:** Backend is running, ready for production

```bash
start.bat
# OR
python main.py
```

### 2️⃣ Full System with Video File

**Use when:** Testing with recorded video

```bash
python main.py --video video.mp4
```

_(Put video.mp4 in cv/ folder)_

### 3️⃣ Visual Test (See Detection Boxes)

**Use when:** Checking if camera/detection works

```bash
visual_test.bat
# OR
python visual_test.py
```

- Green boxes = detected people
- Press 'q' to quit
- Press 's' to screenshot

### 4️⃣ Demo Mode (See Metadata Output)

**Use when:** Want to see what backend receives

```bash
python demo.py 30
```

_(Runs for 30 seconds)_

### 5️⃣ System Test (Verify All Components)

**Use when:** Troubleshooting or after setup

```bash
test.bat
# OR
python test_system.py
```

---

## 🎬 VIDEO FILE USAGE

### Put Video in cv/ Folder

```
cv/
├── video.mp4  ← Your video here
└── main.py
```

### Run with Video

```bash
# Simple
python main.py --video video.mp4

# With path
python main.py --video path/to/video.mp4

# With different camera
python main.py --camera 1

# With IP camera
python main.py --rtsp rtsp://192.168.1.100:554/stream
```

---

## 📊 WHAT TO EXPECT

### ✅ Successful Run Looks Like:

```
============================================================
🎥 CROWD MONITORING - CV MODULE
============================================================

[1/4] Initializing video reader...
✓ Camera opened: CAM_01
  Target resolution: 1280×720
[2/4] Loading YOLOv8 model...
✓ Model loaded
[3/4] Building metadata pipeline...
[4/4] Preparing WebSocket connection...

✓ Initialization complete
⏱️  Send interval: 5.0s | Press Ctrl+C to stop

------------------------------------------------------------
Connecting to backend...
✓ Connected to backend
------------------------------------------------------------

🚀 Processing started

📹 Frame: 42 | 👥 People: 3 | ⏱️ Next: 2.3s
📤 SENT → People: 3 | Avg: 2.8 | Max: 5 | Min: 1
```

### ⚠️ Common Issues:

**Camera Not Opening**

```
❌ Failed to open video source: 0
```

→ Try: `python main.py --camera 1` or use video file

**Backend Not Running**

```
❌ Backend connection failed
```

→ Start Node.js backend first, or use demo mode

**No People Detected**

```
👥 People: 0
```

→ Normal! Move in front of camera

---

## 📤 BACKEND RECEIVES (Every 5 Seconds)

```json
{
  "camera_id": "CAM_01",
  "detections": [
    { "x": 620, "y": 340, "w": 60, "h": 150 },
    { "x": 210, "y": 400, "w": 55, "h": 140 }
  ],
  "timestamp": "2026-01-03T16:30:45.123456",
  "detection_count": 2,
  "interval_stats": {
    "avg_people": 2.8,
    "max_people": 5,
    "min_people": 1,
    "interval_seconds": 5.0
  }
}
```

**What it means:**

- `detections` = Bounding boxes (x, y, width, height)
- `detection_count` = People in latest frame
- `avg_people` = Average over last 5 seconds
- `max_people` = Peak in last 5 seconds
- `min_people` = Minimum in last 5 seconds

---

## ⚙️ CONFIGURATION

### Change Settings in config.py:

```python
# Camera source
"source": 0              # Webcam
"source": "video.mp4"    # Video file

# Detection sensitivity
"confidence": 0.4        # Lower = more detections
"confidence": 0.6        # Higher = fewer false positives

# Frame processing
"frame_skip": 2          # Process every 2nd frame
"frame_skip": 3          # Faster but less smooth
```

---

## 🐛 TROUBLESHOOTING

### Test Each Component:

```bash
# 1. Check packages installed
python -c "import cv2, ultralytics; print('✅ OK')"

# 2. Test camera access
python video_reader.py

# 3. Test detection
python detector.py

# 4. Full system test
python test_system.py
```

### If Nothing Works:

```bash
# Reinstall dependencies
cd cv
rmdir /s venv
setup_venv.bat
```

---

## 📁 FILE REFERENCE

| File             | Purpose             | Command                 |
| ---------------- | ------------------- | ----------------------- |
| `main.py`        | Full system         | `python main.py`        |
| `visual_test.py` | See detection boxes | `python visual_test.py` |
| `demo.py`        | See metadata        | `python demo.py 30`     |
| `test_system.py` | Verify components   | `python test_system.py` |
| `config.py`      | Settings            | Edit manually           |

---

## 🎯 TESTING WORKFLOW

### Before Hackathon Demo:

```bash
1. test.bat                      # Verify all works
2. visual_test.bat               # Check detection quality
3. python demo.py 10             # Verify metadata format
4. python main.py                # Full run with backend
```

### Quick Daily Check:

```bash
visual_test.bat
```

### Debug Issues:

```bash
test.bat
```

---

## 🔑 KEY COMMANDS

```bash
# Quick start (webcam)
start.bat

# Quick start (video file)
python main.py --video video.mp4

# Visual check
visual_test.bat

# See metadata
python demo.py 30

# Full test
test.bat

# Stop anything
Ctrl + C
```

---

## ✅ SUCCESS CHECKLIST

Before your demo/presentation:

- [ ] Run `test.bat` - all 6 tests pass
- [ ] Run `visual_test.bat` - see green boxes
- [ ] Backend is running on port 3000
- [ ] Run `python main.py` - see metadata sent
- [ ] Check backend receives data every 5 seconds

---

## 🆘 EMERGENCY COMMANDS

```bash
# Kill Python processes
taskkill /F /IM python.exe

# Restart from scratch
cd cv
rmdir /s venv
setup_venv.bat
test.bat

# Use video instead of broken camera
python main.py --video video.mp4
```

---

## 💡 PRO TIPS

1. **Test with video file first** - easier than debugging camera
2. **Use demo mode** - when backend isn't ready
3. **Screenshot feature** - press 's' in visual test for proof
4. **Lower confidence** - if not detecting people (edit config.py)
5. **Check logs** - scroll up if errors appear

---

## 📞 QUICK REFERENCE

| Need                | Command                            |
| ------------------- | ---------------------------------- |
| Setup environment   | `setup_venv.bat`                   |
| Test everything     | `test.bat`                         |
| See camera + boxes  | `visual_test.bat`                  |
| See metadata output | `python demo.py 30`                |
| Run with webcam     | `start.bat`                        |
| Run with video      | `python main.py --video video.mp4` |
| Stop                | `Ctrl+C`                           |

---

**That's it! Everything you need is here. Save this file and you're good to go. 🚀**
