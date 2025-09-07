# SnapCap - Complete File Structure

## 📁 Repository Overview

```
snapcap-app/
├── 🚀 Launch Files
│   ├── launch.sh                    # Quick launch script (Linux/Mac)
│   ├── launch.bat                   # Quick launch script (Windows)
│   └── scripts/
│       └── setup.js                 # Automated setup script
│
├── ⚙️ Configuration Files  
│   ├── package.json                 # Dependencies and scripts
│   ├── vite.config.ts              # Vite build configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.node.json          # Node.js TypeScript config
│   ├── .eslintrc.cjs               # ESLint configuration
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore rules
│
├── 📱 Core Application
│   ├── App.tsx                     # 🎯 MAIN APP COMPONENT
│   ├── index.html                  # HTML entry point with PWA setup
│   └── src/
│       └── main.tsx                # React application entry point
│
├── 🧩 React Components
│   └── components/
│       ├── 🔐 Authentication
│       │   └── AuthView.tsx        # Login/signup flows
│       │
│       ├── 📱 Core Views
│       │   ├── FeedView.tsx        # Social media feed (Instagram-like)
│       │   ├── MapView.tsx         # Interactive Google Maps with pins
│       │   ├── CameraView.tsx      # Photo capture with AI captions
│       │   ├── ProfileView.tsx     # User profile management
│       │   ├── StoriesView.tsx     # Story content viewer
│       │   ├── ChatView.tsx        # Chat list and messaging
│       │   ├── IndividualChatView.tsx # Individual chat interface
│       │   ├── SettingsView.tsx    # App settings and preferences
│       │   └── EditProfileView.tsx # Profile editing interface
│       │
│       ├── 💬 Social Features
│       │   ├── DuetView.tsx        # Caption duets (collaborative poems)
│       │   ├── FriendsView.tsx     # Friends and social connections
│       │   ├── OtherProfileView.tsx # Other users' profiles
│       │   ├── CommentModal.tsx    # Comments and replies
│       │   ├── ShareModal.tsx      # Cross-platform sharing
│       │   ├── FollowersModal.tsx  # Followers/following lists
│       │   └── StoryUploadView.tsx # Story creation interface
│       │
│       ├── 🎨 UI & Effects
│       │   ├── BottomNavigation.tsx # Professional bottom navigation
│       │   └── LiquidEtherBackground.tsx # Dynamic animated backgrounds
│       │
│       ├── 🖼️ Figma Integration
│       │   └── figma/
│       │       └── ImageWithFallback.tsx # Protected image component
│       │
│       └── 🎭 UI Components (shadcn/ui)
│           └── ui/ (50+ components)
│               ├── accordion.tsx, alert.tsx, button.tsx
│               ├── card.tsx, dialog.tsx, input.tsx
│               ├── tooltip.tsx, dropdown-menu.tsx
│               └── ... (complete UI component library)
│
├── 🎨 Styling & Design
│   └── styles/
│       └── globals.css             # 🎯 TAILWIND V4 + DESIGN SYSTEM
│                                   # Professional design tokens
│                                   # Glass morphism effects
│                                   # Animation definitions
│                                   # Typography system
│
├── 🔧 Utilities & Tools
│   ├── tools/
│   │   └── unsplash.ts            # Image API integration
│   └── types/
│       └── google-maps.d.ts       # Google Maps TypeScript definitions
│
├── 📱 PWA Configuration
│   └── public/
│       └── manifest.json          # Progressive Web App manifest
│
└── 📚 Documentation
    ├── README.md                  # 🎯 MAIN DOCUMENTATION
    ├── DEVELOPMENT.md             # Developer guide
    ├── STRUCTURE.md               # This file
    ├── Attributions.md            # Credits and attributions
    └── guidelines/
        └── Guidelines.md          # Development guidelines
```

## 🎯 Key Entry Points

| File | Purpose | Description |
|------|---------|-------------|
| **App.tsx** | Main Component | Core application with state management |
| **styles/globals.css** | Design System | Tailwind V4 + custom design tokens |
| **components/MapView.tsx** | Maps Integration | Google Maps with advanced markers |
| **components/FeedView.tsx** | Social Feed | Instagram-like social media feed |
| **package.json** | Configuration | Dependencies and build scripts |

## 🏗️ Architecture Layers

### 1. **Presentation Layer** (Components)
- React functional components with hooks
- TypeScript for type safety
- Motion/React for animations
- Responsive design with Tailwind CSS

### 2. **State Management**
- Local component state (useState)
- Lifted state in App.tsx for cross-component data
- No external state management (deliberately simple)

### 3. **Styling System**
- Tailwind CSS V4 with custom design tokens
- Glass morphism effects
- Professional dark theme
- Responsive design patterns

### 4. **External Integrations**
- Google Maps API (with fallback to demo mode)
- Unsplash API for high-quality images
- Browser APIs (Camera, Geolocation)

## 🎨 Design System Architecture

### Color System
```css
/* Professional gradients */
--gradient-primary: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
--gradient-secondary: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);

/* Glass morphism levels */
.glass { /* Basic glass effect */ }
.glass-dark { /* Darker variant */ }
.glass-elevated { /* Enhanced for modals */ }
```

### Component Categories
- **Views**: Full-screen components (FeedView, MapView, etc.)
- **Modals**: Overlay components (CommentModal, ShareModal, etc.)
- **UI**: Reusable components (Button, Input, Card, etc.)
- **Effects**: Background and animation components

## 📱 Features Mapping

### Core Features → Components
- **Photo Sharing** → CameraView, FeedView
- **Map Pins** → MapView with Google Maps integration
- **Stories** → StoriesView, StoryUploadView
- **Social** → FriendsView, ProfileView, FollowersModal
- **Messaging** → ChatView, IndividualChatView
- **Duets** → DuetView (unique collaborative feature)

### Advanced Features
- **Streaks** → Integrated across multiple components
- **Liquid Backgrounds** → LiquidEtherBackground
- **Professional UI** → shadcn/ui component library
- **PWA Support** → manifest.json + service worker ready

## 🚀 Build & Deployment

### Development
```bash
npm run dev      # Start development server
npm run lint     # Check code quality
npm run setup    # Run setup script
```

### Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

### Output Structure
```
dist/
├── index.html           # Entry point
├── assets/
│   ├── index-[hash].js  # Main application bundle
│   ├── vendor-[hash].js # Third-party dependencies
│   └── index-[hash].css # Compiled styles
└── manifest.json        # PWA manifest
```

## 🔧 Customization Points

### Easy Customizations
1. **Colors**: Update CSS variables in `styles/globals.css`
2. **Logo**: Replace brand elements in components
3. **API Keys**: Update environment variables
4. **Demo Data**: Modify sample data in App.tsx

### Advanced Customizations
1. **Add Backend**: Integrate with Supabase/Firebase
2. **New Features**: Add components following existing patterns
3. **Styling**: Extend the design system
4. **Integrations**: Add new API integrations in tools/

---

**This structure represents a complete, production-ready social media application with professional design and comprehensive functionality.** ✨