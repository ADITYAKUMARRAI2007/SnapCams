# SnapCap Development Guide

## 🏗️ Architecture Overview

SnapCap is built using modern React patterns with TypeScript for type safety. The application follows a component-based architecture with clear separation of concerns.

### Core Technologies
- **React 18** with Hooks and Concurrent Features
- **TypeScript** for type safety and better DX
- **Vite** for fast development and building
- **Tailwind CSS V4** with custom design tokens
- **Motion/React** for smooth animations
- **Google Maps API** for map functionality

### Project Structure
```
├── App.tsx                     # Main app component with state management
├── src/
│   └── main.tsx               # React entry point
├── components/
│   ├── AuthView.tsx           # Authentication flows
│   ├── FeedView.tsx           # Social media feed
│   ├── MapView.tsx            # Interactive map with pins
│   ├── CameraView.tsx         # Photo capture interface
│   ├── ProfileView.tsx        # User profile management
│   ├── ChatView.tsx           # Messaging system
│   ├── StoriesView.tsx        # Story content viewer
│   ├── SettingsView.tsx       # Application settings
│   ├── LiquidEtherBackground.tsx # Dynamic backgrounds
│   ├── figma/                 # Figma-imported components
│   └── ui/                    # Reusable UI components (shadcn/ui)
├── styles/
│   └── globals.css            # Tailwind V4 styles & design tokens
├── types/
│   └── google-maps.d.ts       # TypeScript definitions
└── tools/
    └── unsplash.ts            # Image API utilities
```

## 🎨 Design System

### Color Palette
The app uses a dark theme with carefully crafted gradients:
- **Primary**: Blue gradients (#3b82f6 to #8b5cf6)
- **Secondary**: Subtle grays with glass morphism
- **Accent**: Green and cyan for highlights
- **Background**: Deep blacks with gradient overlays

### Glass Morphism
Three levels of glass effects:
- `.glass` - Basic glass effect
- `.glass-dark` - Darker variant for overlays
- `.glass-elevated` - Enhanced for modals

### Typography
Custom typography scale with proper font weights:
- Headings: Medium weight (500)
- Body text: Normal weight (400) 
- No manual font size classes (uses CSS variables)

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- Modern browser with ES2020 support
- Google Maps API key (optional, falls back to demo mode)

### Quick Start
```bash
# Clone and install
git clone <repo>
cd snapcap-app
npm install

# Start development
npm run dev

# Open http://localhost:3000
```

### Environment Configuration
Create `.env.local`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_UNSPLASH_ACCESS_KEY=your_api_key_here
VITE_DEMO_MODE=true
```

## 📱 Component Guidelines

### State Management
- **Local State**: useState for component-specific data
- **Lifted State**: State lifted to App.tsx for cross-component sharing
- **No Redux**: Deliberately simple state management

### Component Patterns
```typescript
// Preferred pattern for components
interface ComponentProps {
  required: string;
  optional?: number;
  onAction: (data: DataType) => void;
}

export function Component({ required, optional = 0, onAction }: ComponentProps) {
  // Implementation
}
```

### Animation Guidelines
- Use Motion/React for complex animations
- Prefer CSS transitions for simple hover states
- Follow the design system's timing functions
- AnimatePresence for mount/unmount animations

### Image Handling
- Use `ImageWithFallback` for new images
- Leverage Unsplash API for demo content
- Optimize for mobile viewing

## 🗺️ Google Maps Integration

### Implementation
- Uses Advanced Marker Element (latest Google Maps API)
- Fallback to demo mode when API key not provided
- Custom styling matches app theme
- Pin clustering for performance

### Custom Markers
```typescript
// Example custom marker implementation
const marker = new google.maps.marker.AdvancedMarkerElement({
  map,
  position: { lat, lng },
  content: customElement
});
```

## 💬 Chat System

### Features
- Real-time messaging simulation
- Group and individual chats
- Message threading
- Online status indicators
- Typing indicators

### Data Structure
```typescript
interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  type: 'text' | 'image' | 'system';
}
```

## 📸 Camera Integration

### Implementation
- Uses browser MediaDevices API
- Captures high-quality images
- AI-like caption generation (simulated)
- Hashtag extraction from captions
- Integration with map pin creation

### Security Considerations
- Requests camera permissions properly
- Handles permission denials gracefully
- No automatic uploads to external services

## 🎯 Performance Optimizations

### Implemented Optimizations
- **Code Splitting**: Manual chunks in Vite config
- **Lazy Loading**: AnimatePresence for modals
- **Image Optimization**: Proper Unsplash sizing
- **Bundle Analysis**: Separate vendor chunks
- **Smooth Scrolling**: Momentum scrolling on mobile

### Performance Monitoring
```bash
# Build analysis
npm run build
# Check dist/ folder size
```

## 🧪 Testing Strategy

### Current Testing
- TypeScript compile-time checking
- ESLint for code quality
- Manual testing across features

### Recommended Additions
- Jest + React Testing Library for unit tests
- Cypress for E2E testing
- Visual regression testing for UI components

## 🚀 Deployment

### Build Process
```bash
npm run build  # TypeScript compilation + Vite build
```

### Deployment Targets
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Firebase Hosting**: Google integration
- **Traditional hosting**: Deploy dist/ folder

### Environment Variables in Production
```bash
# Set these in your deployment platform
VITE_GOOGLE_MAPS_API_KEY=production_key
VITE_UNSPLASH_ACCESS_KEY=production_key
VITE_DEMO_MODE=false
```

## 🔐 Security Considerations

### Implemented Security
- Client-side only (no sensitive server data)
- API keys in environment variables
- Input sanitization for user content
- HTTPS-only in production

### Security Best Practices
- Regular dependency updates
- No sensitive data in localStorage
- Proper CORS configuration if adding backend
- Content Security Policy headers

## 🐛 Common Issues & Solutions

### Development Issues
1. **Build errors**: Check TypeScript configuration
2. **Styling issues**: Verify Tailwind V4 classes
3. **Animation glitches**: Check AnimatePresence usage
4. **Map not loading**: Verify API key and network

### Production Issues
1. **Route not found**: Configure server for SPA routing
2. **Assets not loading**: Check base URL configuration
3. **Performance**: Enable gzip compression
4. **Mobile issues**: Test on actual devices

## 📈 Future Enhancements

### Planned Features
- [ ] Real backend integration (Supabase/Firebase)
- [ ] Push notifications
- [ ] Progressive Web App enhancements
- [ ] Offline functionality
- [ ] AI-powered caption generation
- [ ] Video support
- [ ] Advanced analytics

### Technical Improvements
- [ ] Unit test coverage
- [ ] Performance monitoring
- [ ] Error boundary implementation
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)

## 🤝 Contributing

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Follow component naming conventions
- Write descriptive commit messages

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

---

**Happy coding! 🚀** 

For questions or issues, please check the main README.md or create an issue in the repository.