#!/bin/bash

echo ""
echo "=========================================="
echo " 🚀 SnapCap Launch Script (Unix/Linux/macOS)"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js is available"
node --version

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    echo "Please ensure you're running this script from the project root directory"
    echo ""
    exit 1
fi

echo "✅ package.json found"

# Make the script executable
chmod +x scripts/setup.js

# Run setup script
echo ""
echo "🔧 Running setup script..."
node scripts/setup.js

# Run verification
echo ""
echo "🔍 Verifying project setup..."
node scripts/verify.js

# Check which package manager to use
PACKAGE_MANAGER="npm"

if command -v yarn &> /dev/null && [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
elif command -v pnpm &> /dev/null && [ -f "pnpm-lock.yaml" ]; then
    PACKAGE_MANAGER="pnpm"
fi

echo "📦 Using package manager: $PACKAGE_MANAGER"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    $PACKAGE_MANAGER install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        echo ""
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo ""
echo "🌟 Starting SnapCap development server..."
echo "Server will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

$PACKAGE_MANAGER run dev