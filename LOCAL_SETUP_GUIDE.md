# 🌟 Manifest - Local Setup Guide

Complete guide to run your Manifestation & Affirmation app locally for personal use.

---

## 📋 Prerequisites

Before you begin, install the following on your local machine:

### Required Software:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8+) - [Download](https://www.python.org/)
- **MongoDB** (Community Edition) - [Download](https://www.mongodb.com/try/download/community)
- **Yarn** (package manager) - Install via `npm install -g yarn`
- **Expo CLI** - Install via `npm install -g @expo/cli`

### Optional (for mobile builds):
- **Android Studio** (for Android builds)
- **Xcode** (for iOS builds - Mac only)

---

## 📦 Project Structure

```
manifest-app/
├── backend/           # FastAPI Python backend
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/          # Expo React Native app
│   ├── app/          # Screens and routes
│   ├── store/        # State management
│   ├── package.json
│   └── .env
└── LOCAL_SETUP_GUIDE.md
```

---

## 🚀 Step-by-Step Setup

### 1️⃣ Download Your Project

**Option A: Save to GitHub (Recommended)**
1. In Emergent, click your profile → "Connect GitHub"
2. Click "Save to GitHub" button
3. Clone to your local machine:
```bash
git clone https://github.com/your-username/manifest-app.git
cd manifest-app
```

**Option B: Manual Download**
1. Use VS Code view in Emergent
2. Copy all files to your local directory

---

### 2️⃣ Backend Setup (FastAPI)

#### Install Dependencies:
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables:
Create/Update `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=manifest_app
```

#### Start MongoDB:
```bash
# On Windows:
net start MongoDB

# On macOS/Linux:
sudo service mongod start
# or
brew services start mongodb-community
```

#### Run Backend Server:
```bash
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

✅ Backend should now be running at: `http://localhost:8001`

Test it: Open `http://localhost:8001/api/affirmations` in your browser

---

### 3️⃣ Frontend Setup (Expo)

#### Install Dependencies:
```bash
cd frontend
yarn install
```

#### Configure Environment Variables:
Create/Update `frontend/.env`:
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

**Important:** For physical device testing, replace `localhost` with your computer's local IP address:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:8001
```

To find your local IP:
- **Windows:** Run `ipconfig` in CMD, look for IPv4 Address
- **Mac/Linux:** Run `ifconfig` or `ip addr`, look for inet address

#### Start Expo Development Server:
```bash
yarn start
# or
npx expo start
```

✅ Expo should now be running!

---

## 📱 Testing the App

### Option 1: Web Browser (Quick Test)
Press `w` in the Expo terminal to open in web browser

### Option 2: Expo Go App (Physical Device)
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in your terminal
3. App will load on your device

### Option 3: Emulator/Simulator
- **Android:** Press `a` in terminal (requires Android Studio)
- **iOS:** Press `i` in terminal (requires Xcode, Mac only)

---

## 🏗️ Building for Production

### Android APK Build:
```bash
cd frontend
npx expo build:android
```

### iOS Build (Mac only):
```bash
cd frontend
npx expo build:ios
```

**Note:** Building for iOS requires an Apple Developer account ($99/year)

### Using EAS Build (Modern Approach):
```bash
npm install -g eas-cli
eas login
eas build --platform android
# or
eas build --platform ios
```

---

## 🔧 Troubleshooting

### Backend Issues:

**"MongoDB connection failed"**
- Ensure MongoDB is running: `sudo service mongod status`
- Check connection string in `.env`

**"Module not found"**
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues:

**"Cannot connect to backend"**
- Ensure backend is running on port 8001
- Check `EXPO_PUBLIC_BACKEND_URL` in `.env`
- If using physical device, use computer's IP instead of localhost

**"Metro bundler not starting"**
- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && yarn install`

**"Network error" on physical device**
- Make sure phone and computer are on same Wi-Fi
- Update backend URL to use local IP, not localhost
- Check firewall settings

---

## 📂 Database Management

### Seed Example Data:
Once backend is running, seed example affirmations:
```bash
curl -X POST http://localhost:8001/api/affirmations/seed
```

### View Database (Optional):
Install MongoDB Compass (GUI):
- Download: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`
- Database: `manifest_app`

---

## 🎨 Customization

### Change App Name:
Edit `frontend/app.json`:
```json
{
  "name": "Your App Name",
  "slug": "your-app-slug"
}
```

### Change Colors:
Update theme colors in your screen files (look for color values like `#9370DB`)

### Add More Notification Times:
In Settings screen, tap "Add Notification Time"

---

## 🔐 Important Notes

### Security for Personal Use:
- Keep your `.env` files secure (they contain sensitive info)
- Don't commit `.env` files to public repositories
- Use strong passwords if deploying publicly

### CORS Configuration:
Current backend allows all origins (`*`). For production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Your specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📞 Need Help?

### Common Commands Cheat Sheet:

**Backend:**
```bash
# Start backend
cd backend && python -m uvicorn server:app --reload --port 8001

# Install new package
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
# Start Expo
cd frontend && yarn start

# Clear cache
yarn start --clear

# Install new package
yarn add package-name

# Build for Android
npx expo build:android
```

**MongoDB:**
```bash
# Start MongoDB
sudo service mongod start  # Linux
brew services start mongodb-community  # Mac
net start MongoDB  # Windows

# Stop MongoDB
sudo service mongod stop
```

---

## 🎯 Quick Start (After First Setup)

Every time you want to run the app locally:

1. **Start MongoDB:**
   ```bash
   sudo service mongod start
   ```

2. **Start Backend (Terminal 1):**
   ```bash
   cd backend
   python -m uvicorn server:app --reload --port 8001
   ```

3. **Start Frontend (Terminal 2):**
   ```bash
   cd frontend
   yarn start
   ```

4. **Open in Expo Go or Browser**

---

## 🌟 Features Included

✅ Daily affirmation practice
✅ Unlimited custom affirmations
✅ Progress tracking with streaks
✅ Multiple notification times
✅ Beautiful gradient UI
✅ Smooth animations
✅ Offline-capable
✅ Cross-platform (iOS & Android)

---

## 📱 System Requirements

**For Development:**
- 8GB RAM (minimum)
- 10GB free disk space
- Windows 10/11, macOS 10.15+, or Linux

**For Running the App:**
- Android 5.0+ or iOS 13+
- 50MB free space on device

---

## 🎉 You're All Set!

Your Manifestation & Affirmation app is now ready to run locally. Start manifesting your dreams! ✨

For any questions or issues, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Made with ❤️ for personal mindfulness and growth**
