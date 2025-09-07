#!/usr/bin/env node

/**
 * SnapCap Setup Script
 * Automates the initial setup process for the SnapCap application
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SnapCap...\n');

// Check if .env.local exists, if not, create from template
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envLocalPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ Created .env.local from template');
  } else {
    // Create a basic .env.local file
    const defaultEnv = `# SnapCap Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
VITE_DEMO_MODE=true
`;
    fs.writeFileSync(envLocalPath, defaultEnv);
    console.log('✅ Created default .env.local file');
  }
} else {
  console.log('ℹ️  .env.local already exists');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

if (majorVersion < 18) {
  console.log('⚠️  Warning: Node.js 18+ is recommended. Current version:', nodeVersion);
} else {
  console.log('✅ Node.js version check passed:', nodeVersion);
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\n📝 To enable Google Maps:');
console.log('   - Get API key from: https://console.cloud.google.com/');
console.log('   - Update VITE_GOOGLE_MAPS_API_KEY in .env.local');
console.log('\n✨ Happy coding with SnapCap!');