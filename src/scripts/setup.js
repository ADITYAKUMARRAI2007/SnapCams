#!/usr/bin/env node

/**
 * SnapCap Setup Script
 * Automates the initial setup process for the SnapCap application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SnapCap...\n');

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  if (majorVersion < 18) {
    console.log('⚠️  Warning: Node.js 18+ is recommended. Current version:', nodeVersion);
    console.log('   Download latest from: https://nodejs.org/\n');
  } else {
    console.log('✅ Node.js version check passed:', nodeVersion);
  }
}

function createEnvFile() {
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
VITE_APP_URL=http://localhost:3000
`;
      fs.writeFileSync(envLocalPath, defaultEnv);
      console.log('✅ Created default .env.local file');
    }
  } else {
    console.log('ℹ️  .env.local already exists');
  }
}

function checkPackageManager() {
  let packageManager = 'npm';
  
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    if (fs.existsSync(path.join(__dirname, '..', 'yarn.lock'))) {
      packageManager = 'yarn';
    }
  } catch (e) {
    // yarn not available, use npm
  }
  
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    if (fs.existsSync(path.join(__dirname, '..', 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    }
  } catch (e) {
    // pnpm not available, use npm/yarn
  }
  
  console.log('📦 Package manager detected:', packageManager);
  return packageManager;
}

function createGitignore() {
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build outputs
dist
dist-ssr
*.local

# Environment variables
.env
.env.local
.env.production.local
.env.development.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
Thumbs.db
.DS_Store

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Storybook build outputs
.out
.storybook-out
`;
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('✅ Created .gitignore file');
  }
}

function verifyStructure() {
  const requiredDirs = [
    'src',
    'components',
    'components/ui',
    'styles',
    'public'
  ];
  
  const requiredFiles = [
    'src/App.tsx',
    'src/main.tsx',
    'index.html',
    'package.json',
    'vite.config.ts',
    'tsconfig.json'
  ];
  
  console.log('🔍 Verifying project structure...');
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Missing required file: ${file}`);
      allFilesExist = false;
    }
  });
  
  if (allFilesExist) {
    console.log('✅ All required files are present');
  }
  
  return allFilesExist;
}

// Run setup steps
try {
  checkNodeVersion();
  createEnvFile();
  createGitignore();
  const structureValid = verifyStructure();
  const packageManager = checkPackageManager();
  
  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log(`1. Run: ${packageManager} install`);
  console.log(`2. Run: ${packageManager} run dev`);
  console.log('3. Open: http://localhost:3000');
  
  console.log('\n📝 Optional Configuration:');
  console.log('   • Google Maps API: Update VITE_GOOGLE_MAPS_API_KEY in .env.local');
  console.log('   • Unsplash API: Update VITE_UNSPLASH_ACCESS_KEY in .env.local');
  console.log('   • Get Google Maps API: https://console.cloud.google.com/');
  console.log('   • Get Unsplash API: https://unsplash.com/developers');
  
  if (!structureValid) {
    console.log('\n⚠️  Some files are missing. Please ensure you have downloaded the complete project.');
  }
  
  console.log('\n✨ Happy coding with SnapCap!');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}