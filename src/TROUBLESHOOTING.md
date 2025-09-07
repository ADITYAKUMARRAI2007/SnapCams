# SnapCap Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Installation Issues

#### Node.js Not Found
**Error**: `'node' is not recognized as an internal or external command`

**Solution**:
1. Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)
2. Restart your terminal/command prompt
3. Verify installation: `node --version`

#### Permission Errors (macOS/Linux)
**Error**: `EACCES: permission denied`

**Solutions**:
```bash
# Option 1: Use npx for one-time commands
npx vite

# Option 2: Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Option 3: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
```

#### Dependencies Installation Failed
**Error**: `npm ERR! peer dep missing`

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Fresh install
npm install

# If still failing, try legacy peer deps
npm install --legacy-peer-deps
```

### Development Server Issues

#### Port 3000 Already in Use
**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Option 1: Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3001
```

#### Module Not Found Errors
**Error**: `Cannot resolve module './components/...'`

**Solutions**:
1. Check if file exists at the specified path
2. Verify import path is correct (case-sensitive)
3. Ensure file extensions are included (.tsx, .ts)
4. Restart development server

#### TypeScript Errors
**Error**: Various TypeScript compilation errors

**Solutions**:
```bash
# Clear TypeScript cache
npx tsc --build --clean

# Restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Check tsconfig.json is properly configured
```

### Runtime Issues

#### White Screen / App Not Loading
**Possible Causes**:
- JavaScript errors in browser console
- Missing environment variables
- Build issues

**Solutions**:
1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Verify .env.local file exists
4. Try clearing browser cache
5. Restart development server

#### Images Not Loading
**Possible Causes**:
- Missing Unsplash API key
- Network issues
- CORS problems

**Solutions**:
1. Set `VITE_DEMO_MODE=true` in .env.local
2. Check Unsplash API key is correct
3. Verify network connection
4. Check browser console for errors

#### Map Not Working
**Possible Causes**:
- Missing Google Maps API key
- API key restrictions
- Billing not enabled

**Solutions**:
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable required APIs:
   - Maps JavaScript API
   - Places API (if using places)
3. Check API key restrictions
4. Ensure billing is enabled for the project

### Performance Issues

#### Slow Loading
**Solutions**:
1. Enable image optimization in .env.local:
   ```env
   VITE_IMAGE_OPTIMIZATION=true
   VITE_LAZY_LOADING=true
   ```
2. Clear browser cache
3. Check network connection
4. Reduce image sizes

#### High Memory Usage
**Solutions**:
1. Close unnecessary browser tabs
2. Restart development server
3. Update to latest Node.js version
4. Increase Node.js memory limit:
   ```bash
   node --max-old-space-size=4096 node_modules/.bin/vite
   ```

### Browser Compatibility

#### Modern Browser Required
SnapCap uses modern web technologies and requires:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Development

#### Testing on Mobile Devices
1. Start dev server with host flag:
   ```bash
   npm run dev -- --host
   ```
2. Find your computer's IP address
3. Access from mobile: `http://YOUR_IP:3000`

#### PWA Installation
1. Ensure HTTPS is enabled (required for PWA)
2. Check manifest.json is properly configured
3. Verify service worker is registered

## 🔧 Advanced Debugging

### Enable Debug Mode
Add to .env.local:
```env
VITE_DEBUG_MODE=true
```

### Verbose Logging
```bash
# Enable npm verbose logging
npm run dev --verbose

# Enable Vite debug logging
DEBUG=vite:* npm run dev
```

### Clear All Caches
```bash
# Clear npm cache
npm cache clean --force

# Clear browser cache
# Chrome: Settings > Privacy > Clear browsing data

# Clear Vite cache
rm -rf node_modules/.vite

# Fresh start
rm -rf node_modules package-lock.json
npm install
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check Console Logs**:
   - Browser Developer Tools (F12)
   - Terminal output
   - Network tab for failed requests

2. **Search Existing Issues**:
   - Check GitHub Issues
   - Search Stack Overflow
   - Browse Discord community

3. **Create Detailed Bug Report**:
   Include:
   - Operating system
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Browser and version
   - Steps to reproduce
   - Console error messages
   - Screenshots if relevant

4. **Contact Support**:
   - GitHub Issues: [Create new issue](https://github.com/yourusername/snapcap/issues)
   - Discord: [Join community](https://discord.gg/snapcap)
   - Email: support@snapcap.app

## 🏥 Quick Fixes Checklist

When something goes wrong, try these in order:

- [ ] Restart development server (`Ctrl+C`, then `npm run dev`)
- [ ] Clear browser cache (Hard refresh: `Ctrl+F5`)
- [ ] Check browser console for errors (`F12`)
- [ ] Verify .env.local file exists and is configured
- [ ] Update dependencies (`npm update`)
- [ ] Delete node_modules and reinstall (`rm -rf node_modules && npm install`)
- [ ] Try different browser
- [ ] Restart computer (sometimes helps with port/permission issues)

Remember: Most issues are environment-related and can be resolved with proper setup! 🎯