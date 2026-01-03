# 🎥 Testing Guide - Camera & Detection Verification

## 🔍 Available Test Options

### 1. **Visual Test** (Recommended for Camera Check)

**Shows:** Live camera feed with green boxes around detected people

```bash
visual_test.bat
# OR
venv\Scripts\activate
python visual_test.py
```

**Features:**

- ✅ Live video display
- ✅ Green bounding boxes on detected people
- ✅ Real-time FPS counter
- ✅ Detection count
- ✅ Press 'q' to quit
- ✅ Press 's' to save screenshot

**Use this when:**

- Checking if camera works
- Verifying detection accuracy
- Testing different camera angles
- Adjusting camera position

---

### 2. **System Test** (Full Component Check)

**Tests:** All components without video display

```bash
test.bat
# OR
venv\Scripts\activate
python test_system.py
```

**Checks:**

- ✅ Package installations
- ✅ Configuration validity
- ✅ Camera access
- ✅ YOLOv8 model
- ✅ Detection working
- ✅ Metadata format

**Use this when:**

- First time setup
- After changing configuration
- Troubleshooting issues

---

### 3. **Demo Mode** (Metadata Preview)

**Shows:** Console output of metadata without display

```bash
venv\Scripts\activate
python demo.py 30
```

**Features:**

- ✅ Prints JSON metadata
- ✅ No video window
- ✅ Shows bounding box coordinates
- ✅ Runs for specified seconds
- ✅ Final statistics

**Use this when:**

- Verifying metadata format
- Testing without screen
- Running on headless systems

---

### 4. **Full Application**

**Runs:** Complete system with backend streaming

```bash
start.bat
# OR
venv\Scripts\activate
python main.py
```

**Features:**

- ✅ Streams to backend
- ✅ Production mode
- ✅ WebSocket connection
- ✅ FPS tracking
- ✅ Session stats

**Use this when:**

- Backend is running
- Ready for production
- End-to-end testing

---

## 📸 Visual Test Controls

| Key   | Action                       |
| ----- | ---------------------------- |
| `q`   | Quit the test                |
| `s`   | Save screenshot (with boxes) |
| `ESC` | Alternative quit             |

---

## 📊 Visual Test Display

The visual test shows:

```
┌─────────────────────────────────────────┐
│ FPS: 9.3                               │
│ People: 4                              │
│ Total Detected: 4634                    │
│ Resolution: 1280x720                    │
│ Model: yolov8n.pt                      │
│ Press 'q' to quit, 's' to screenshot   │
├─────────────────────────────────────────┤
│                                         │
│      [Green Box: Person]                │
│           ┌──────┐                     │
│           │      │                     │
│           │ 👤   │ [Green Box: Person]│
│           │      │      ┌───┐         │
│           └──────┘      │👤 │         │
│                         └───┘         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting Visual Test

### Camera Not Opening

```
❌ Failed to open video source: 0
```

**Solution:**

1. Edit `config.py`:
   ```python
   "source": 1  # Try different number
   ```
2. Check camera permissions
3. Try a video file:
   ```python
   "source": "path/to/video.mp4"
   ```

### No Detection Boxes

**Reasons:**

- No people in frame
- Confidence too high
- Poor lighting

**Solution:**
Edit `config.py`:

```python
"confidence": 0.3  # Lower threshold
```

### Low FPS

**Solution:**

- Use smaller model: `"model": "yolov8n.pt"`
- Lower resolution: `640×480`
- Increase frame skip: `"frame_skip": 3`

### Window Not Appearing

- Check if display is connected
- Try running in PowerShell instead of cmd
- Verify OpenCV installation:
  ```bash
  python -c "import cv2; print(cv2.__version__)"
  ```

---

## 📷 Screenshot Feature

When you press 's' during visual test:

- Saves current frame with boxes
- Filename: `screenshot_YYYYMMDD_HHMMSS.jpg`
- Saved in `cv/` folder
- Includes all detection boxes

**Use screenshots to:**

- Document detection accuracy
- Share results with team
- Debug false positives
- Show camera coverage

---

## 🎯 Quick Test Workflow

### First Time:

1. Run system test

   ```bash
   test.bat
   ```

2. Run visual test

   ```bash
   visual_test.bat
   ```

3. Adjust camera/settings if needed

### Before Deployment:

1. Visual test (check detection)
2. Demo mode (verify metadata)
3. Full application (test backend)

---

## 💡 Tips

**Best Practices:**

- ✅ Test in actual deployment lighting
- ✅ Check different crowd densities
- ✅ Verify camera angle covers area
- ✅ Test at different times of day

**Performance:**

- Lower confidence = more detections (more false positives)
- Higher confidence = fewer detections (more accurate)
- Recommended: `0.4` for crowds, `0.5` for sparse areas

**Camera Position:**

- Higher angle = better crowd view
- Avoid backlighting
- Ensure people are visible (not too far)
- Test maximum distance

---

## 📝 Test Comparison

| Test Type | Display | Metadata | Backend | Use Case            |
| --------- | ------- | -------- | ------- | ------------------- |
| Visual    | ✅ Yes  | ❌ No    | ❌ No   | Camera verification |
| System    | ❌ No   | ❌ No    | ❌ No   | Component check     |
| Demo      | ❌ No   | ✅ Yes   | ❌ No   | Metadata preview    |
| Full App  | ❌ No   | ✅ Yes   | ✅ Yes  | Production          |

---

## 🚀 Recommended Testing Order

1. **System Test** - Verify installation
2. **Visual Test** - Check camera & detection
3. **Demo Mode** - Verify metadata format
4. **Full Application** - Test with backend

---

**Quick Commands:**

```bash
# Visual test (recommended first)
visual_test.bat

# System test
test.bat

# Demo mode
venv\Scripts\activate
python demo.py 30

# Full system
start.bat
```
