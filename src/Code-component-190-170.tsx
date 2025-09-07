# 🚀 SnapCap Quick Start Guide

## ⚡ Super Quick Start (1 minute)

### Windows Users:
1. **Double-click** `launch.bat`
2. **Wait** for automatic setup
3. **Open** http://localhost:3000 when ready

### Mac/Linux Users:
1. **Open Terminal** in project folder
2. **Run** `./launch.sh`
3. **Open** http://localhost:3000 when ready

---

## 📋 Manual Setup (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## ✅ Verify Setup

**Check if everything is working:**
```bash
npm run verify
```

---

## 🆘 Having Issues?

### Quick Fixes:
1. **Restart everything:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Fresh install:**
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

3. **Check requirements:**
   - Node.js 18+ installed? `node --version`
   - In correct folder? Look for `package.json`

### Still stuck?
- See `TROUBLESHOOTING.md` for detailed solutions
- Check `README.md` for complete documentation

---

## 🎯 What You'll See

1. **Loading Screen** - SnapCap logo with blue gradient
2. **Authentication** - Simple login/signup screen
3. **Social Feed** - Instagram-like interface
4. **Map View** - Interactive pin-based memories
5. **Camera** - AI-powered photo capture
6. **Profile** - User management system

---

## 🔧 Optional Configuration

### For Google Maps (Optional):
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### For Unsplash Photos (Optional):
1. Get API key from [Unsplash Developers](https://unsplash.com/developers)
2. Add to `.env.local`:
   ```
   VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

**Note:** App works perfectly without these API keys in demo mode!

---

## 📱 Mobile Testing

**Test on your phone:**
1. Start dev server: `npm run dev -- --host`
2. Find your computer's IP address
3. Open `http://YOUR_IP:3000` on your phone

---

## 🎉 You're Ready!

**SnapCap Features:**
- 📱 Social feed with stories
- 🗺️ Location-based memories
- 📸 AI-powered camera
- 🎭 Caption duets (poetry responses)
- 💬 Real-time chat
- 👤 Profile management
- 🌊 Beautiful animations

**Happy creating with SnapCap!** ✨