#!/bin/bash

# SnapCap Quick Launch Script
# Makes it easy to get the app running

echo "🚀 SnapCap Quick Launch"
echo "======================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js 18+ is recommended. Current version: $(node -v)"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the SnapCap directory."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating environment configuration..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from template"
    else
        cat > .env.local << EOL
# SnapCap Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
VITE_DEMO_MODE=true
EOL
        echo "✅ Created default .env.local"
    fi
else
    echo "✅ Environment configuration exists"
fi

echo ""
echo "🎉 Setup complete! Starting development server..."
echo ""
echo "📝 Quick tips:"
echo "   • App will open at: http://localhost:3000"
echo "   • Demo mode is enabled by default"
echo "   • To enable Google Maps: Add your API key to .env.local"
echo "   • Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev