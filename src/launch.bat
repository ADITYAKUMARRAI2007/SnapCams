@echo off
echo.
echo ==========================================
echo  🚀 SnapCap Launch Script (Windows)
echo ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is available
node --version

:: Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found
    echo Please ensure you're running this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo ✅ package.json found

:: Run setup script
echo.
echo 🔧 Running setup script...
node scripts/setup.js

:: Run verification
echo.
echo 🔍 Verifying project setup...
node scripts/verify.js

:: Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

:: Start the development server
echo.
echo 🌟 Starting SnapCap development server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause