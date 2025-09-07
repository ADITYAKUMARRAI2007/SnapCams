#!/usr/bin/env node

/**
 * SnapCap Verification Script
 * Checks if the project is properly set up and ready to run
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying SnapCap setup...\n');

let hasErrors = false;

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ Missing ${description}: ${filePath}`);
    hasErrors = true;
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}/`);
    return true;
  } else {
    console.log(`❌ Missing ${description}: ${dirPath}/`);
    hasErrors = true;
    return false;
  }
}

// Check core files
console.log('📁 Core Files:');
checkFile('package.json', 'Package configuration');
checkFile('vite.config.ts', 'Vite configuration');
checkFile('tsconfig.json', 'TypeScript configuration');
checkFile('index.html', 'HTML entry point');
checkFile('.env.example', 'Environment template');

console.log('\n📂 Source Structure:');
checkDirectory('src', 'Source directory');
checkFile('src/App.tsx', 'Main application');
checkFile('src/main.tsx', 'Entry point');

console.log('\n🧩 Components:');
checkDirectory('components', 'Components directory');
checkDirectory('components/ui', 'UI components');
checkFile('components/AuthView.tsx', 'Authentication component');
checkFile('components/FeedView.tsx', 'Feed component');
checkFile('components/MapView.tsx', 'Map component');
checkFile('components/CameraView.tsx', 'Camera component');

console.log('\n🎨 Styles:');
checkDirectory('styles', 'Styles directory');
checkFile('styles/globals.css', 'Global styles');

console.log('\n🔧 Scripts:');
checkFile('scripts/setup.js', 'Setup script');
checkFile('launch.sh', 'Unix launch script');
checkFile('launch.bat', 'Windows launch script');

// Check package.json contents
console.log('\n📦 Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'motion',
    'lucide-react',
    'tailwindcss'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  hasErrors = true;
}

// Check if node_modules exists
console.log('\n📚 Installation:');
if (fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('✅ Dependencies installed');
} else {
  console.log('⚠️  Dependencies not installed (run: npm install)');
}

// Check environment file
console.log('\n🌍 Environment:');
if (fs.existsSync(path.join(__dirname, '..', '.env.local'))) {
  console.log('✅ Environment file configured');
} else {
  console.log('⚠️  No .env.local file (will be created automatically)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Setup verification FAILED');
  console.log('\nIssues found:');
  console.log('• Some required files are missing');
  console.log('• Please ensure you have the complete project');
  console.log('• Run: npm run setup');
  console.log('\nFor help, see TROUBLESHOOTING.md');
} else {
  console.log('✅ Setup verification PASSED');
  console.log('\nYour SnapCap project is ready!');
  console.log('\nNext steps:');
  console.log('1. npm install (if not done already)');
  console.log('2. npm run dev');
  console.log('3. Open http://localhost:3000');
}
console.log('='.repeat(50));