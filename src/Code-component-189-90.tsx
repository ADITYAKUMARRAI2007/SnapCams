@echo off
title SnapCap Quick Launch

echo 🚀 SnapCap Quick Launch
echo ======================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Make sure you're in the SnapCap directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo 🔧 Creating environment configuration...
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo ✅ Created .env.local from template
    ) else (
        echo # SnapCap Environment Variables > .env.local
        echo VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here >> .env.local
        echo VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here >> .env.local
        echo VITE_DEMO_MODE=true >> .env.local
        echo ✅ Created default .env.local
    )
) else (
    echo ✅ Environment configuration exists
)

echo.
echo 🎉 Setup complete! Starting development server...
echo.
echo 📝 Quick tips:
echo    • App will open at: http://localhost:3000
echo    • Demo mode is enabled by default
echo    • To enable Google Maps: Add your API key to .env.local
echo    • Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev

pause