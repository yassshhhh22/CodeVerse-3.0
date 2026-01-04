# 🎥 MULTI-CAMERA SETUP - VISUAL GUIDE

```
┌─────────────────────────────────────────────────────────────┐
│                  CROWD MONITORING SYSTEM                    │
│            Multiple Camera Setup (Laptop + Phones)          │
└─────────────────────────────────────────────────────────────┘
```

## 📱 STEP 1: Phone Setup (One-Time)

```
Android Phone:                      iOS Phone:
┌──────────────┐                   ┌──────────────┐
│   Install    │                   │   Install    │
│  IP Webcam   │                   │   EpocCam    │
│   (FREE)     │                   │   or         │
└──────┬───────┘                   │  DroidCam    │
       │                            └──────┬───────┘
       ▼                                   │
┌──────────────┐                          │
│  Open app    │                          │
│  Start Server│ ◄─────────────────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Note the URL:       │
│  http://192.168.1.   │
│       100:8080       │
└──────────────────────┘
```

## 💻 STEP 2: Update Scripts (Windows)

```
1. Right-click:  start_phone_camera.bat
2. Edit with:    Notepad
3. Change line:  set PHONE_IP=192.168.1.100  ← YOUR phone IP
4. Save file
```

## 🚀 STEP 3: Launch Cameras

### Option A: Easy Mode (Windows) ✅

```
Just double-click these files:

📁 cv/
├── 🔵 start_laptop_camera.bat     ← Double-click #1
├── 🟢 start_phone_camera.bat      ← Double-click #2
└── 🟡 start_phone2_camera.bat     ← Double-click #3 (if 2 phones)

Each opens a window showing camera feed!
```

### Option B: Command Line

```powershell
# Open 3 PowerShell windows, run one command in each:

┌─────────────────────────────────────────────┐
│ Terminal 1: LAPTOP CAMERA                   │
├─────────────────────────────────────────────┤
│ cd cv                                       │
│ python main.py --camera 0 --id CAM_LAPTOP  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Terminal 2: PHONE 1                         │
├─────────────────────────────────────────────┤
│ cd cv                                       │
│ python main.py --rtsp \                    │
│   "http://192.168.1.100:8080/video" \     │
│   --id CAM_PHONE1                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Terminal 3: PHONE 2                         │
├─────────────────────────────────────────────┤
│ cd cv                                       │
│ python main.py --rtsp \                    │
│   "http://192.168.1.101:8080/video" \     │
│   --id CAM_PHONE2                          │
└─────────────────────────────────────────────┘
```

## 📊 STEP 4: View Dashboard

```
Browser:  http://localhost:3000/dashboard

┌───────────────────────────────────────────────────────┐
│  🎥 Select Camera:  [▼ CAM_LAPTOP    ]               │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │                                               │   │
│  │          🔥 LIVE HEATMAP 🔥                  │   │
│  │                                               │   │
│  │   [Green → Yellow → Orange → Red]           │   │
│  │                                               │   │
│  │   ✓ 45 People Detected                       │   │
│  │                                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                        │
│  Switch cameras to see different views!               │
└───────────────────────────────────────────────────────┘
```

## 🎯 Quick Troubleshooting

```
❌ "Camera not found"
   ➜ Run: python find_cameras.py
   ➜ Try: --camera 1 instead of --camera 0

❌ "Can't connect to phone"
   ➜ Check WiFi (same network?)
   ➜ Ping phone: ping 192.168.1.100
   ➜ Verify URL ends with /video
   ➜ Restart IP Webcam app

❌ "Backend error"
   ➜ Start server: cd server && npm run dev
   ➜ Check MongoDB is running
   ➜ Check port 5000 not in use

❌ "Laggy/Slow"
   ➜ In IP Webcam: Lower resolution to 720p
   ➜ In config.py: Increase frame_skip to 3
   ➜ Use yolov8n.pt (nano model)
```

## 📋 Pre-Flight Checklist

Before starting cameras, make sure:

```
✅ Backend running:      cd server && npm run dev
✅ MongoDB running:      Check Task Manager
✅ Python setup done:    cd cv && .\setup_venv.bat
✅ Phone(s) on WiFi:     Same network as PC
✅ Phone app running:    IP Webcam showing URL
✅ IP updated in bat:    start_phone_camera.bat edited
✅ Phone charging:       Long sessions need power
```

## 🎬 Complete Flow Diagram

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Laptop    │     │  Phone 1   │     │  Phone 2   │
│  Camera    │     │  Camera    │     │  Camera    │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                   │
      │  YOLOv8          │  YOLOv8          │  YOLOv8
      │  Detection       │  Detection       │  Detection
      │                  │                   │
      ▼                  ▼                   ▼
┌─────────────────────────────────────────────────┐
│            WebSocket (Port 5000)                │
│                                                  │
│        ┌──────────────────────────┐            │
│        │   Backend Server (Node)  │            │
│        │   - Grid Density Calc     │            │
│        │   - MongoDB Storage       │            │
│        └───────────┬──────────────┘            │
└────────────────────┼─────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │   Dashboard    │
            │  (React + WS)  │
            │                │
            │  📊 Heatmaps   │
            │  🚨 Alerts     │
            │  📈 Analytics  │
            └────────────────┘
```

## 🎯 Camera Naming Best Practices

```
Good Names:              Bad Names:
✅ ENTRANCE_CAM          ❌ CAM1
✅ STAGE_LEFT            ❌ CAMERA
✅ EXIT_DOOR             ❌ TEST
✅ MAIN_HALL             ❌ PHONE
✅ VIP_SECTION           ❌ A

Use descriptive names so you know which camera is which!
```

## 💡 Pro Tips

```
🔹 Test cameras one by one before running all together
🔹 Label your devices (put sticky note "ENTRANCE CAM" on phone)
🔹 Mount phones on tripods for stable positioning
🔹 Keep phones plugged in (USB power banks work great)
🔹 Close Zoom/Teams/Skype before starting (camera conflicts)
🔹 Use ethernet cable for PC if WiFi is unstable
🔹 Position cameras at 45° angle for best person detection
🔹 Avoid backlighting (cameras facing windows = bad)
```

## 🆘 Help Resources

```
📄 QUICK_MULTI_CAMERA.md    → Quick reference cheat sheet
📄 MULTI_CAMERA_GUIDE.md    → Detailed setup guide
📄 PHONE_CAMERA_SETUP.md    → Phone-specific instructions
📄 README.md                 → Full documentation

🔧 python find_cameras.py    → Find available cameras
🔧 python visual_test.py     → Test camera with preview
🔧 python main.py --help     → Command options
```

---

## 🚀 TL;DR - Absolute Quickest Way

```bash
# 1. Setup phone - Install IP Webcam, start server, note IP

# 2. Edit bat file with phone IP
notepad start_phone_camera.bat
# Change: set PHONE_IP=192.168.1.100

# 3. Double-click these:
start_laptop_camera.bat
start_phone_camera.bat

# 4. Open browser
http://localhost:3000/dashboard

# DONE! 🎉
```

---

**Questions?** Check the guides or run `python find_cameras.py` to test! 🎥
