# HH_Puzzle - Hip-Hop Crossword Puzzle Game
## Initial Project Setup & Planning Document

**Project Name:** HH_Puzzle (Working Title)  
**Tech Stack:** Golang Backend + React Native Frontend  
**Development Timeline:** 2 Months  
**Status:** Planning Phase  
**Created:** 2024

---

## 📋 Project Overview

### **Concept**
An interactive hip-hop crossword puzzle game that educates users about hip-hop culture, history, and music while providing an engaging daily challenge experience.

### **Core Philosophy**
- Focus on doing a basic crossword puzzle game **really well**
- Educational and fun
- Clean, premium experience (no ads)
- Room to grow with additional features

---

## 🎯 MVP Feature Set (2 Months)

### **Core Features** ✅

1. **Daily Challenge**
   - One free puzzle per day for all users (including guests)
   - New puzzle released daily
   - Archive of past puzzles for practice (paid users only)

2. **User Authentication**
   - Email/password registration and login
   - Social login (Google, Apple)
   - Guest mode (daily challenge only, no score tracking)

3. **Puzzle System**
   - Basic crossword grid rendering
   - Text-based clues (no audio/visual for MVP)
   - Hint system (reveals first letter, costs points)
   - Points/scoring based on completion time and accuracy

4. **Categorization**
   - Puzzles organized by:
     - Decades (80s, 90s, 2000s, 2010s, 2020s)
     - Regions (NYC, LA, Atlanta, Chicago, etc.)
     - Subgenres (Trap, Boom Bap, Conscious Rap, etc.)

5. **Difficulty Tiers**
   - Beginner (mainstream artists, popular songs)
   - Intermediate (albums, producers, labels, regional scenes)
   - Expert (deep cuts, battle rap, production techniques, history)
   - All tiers unlocked from start (no progression gates)

6. **Leaderboards**
   - Weekly global leaderboard
   - Resets every week
   - Only authenticated users can participate

7. **Culture Corner**
   - Educational hip-hop facts unlocked as progression rewards
   - Historical moments, artist bios, terminology explanations
   - Unlocked after completing puzzles or reaching milestones

8. **User Profiles**
   - Track personal statistics
   - View completed puzzles
   - Manage account settings

9. **Background Music** 🎵
   - Original hip-hop tracks playing during gameplay
   - Toggle on/off in settings
   - Music created by developer
   - Seamless looping during puzzle solving
   - Volume control

### **Monetization Strategy** 💰

- **Free Tier:** Daily challenge only (guests + registered users)
- **Premium Access:** 
  - Individual puzzle packs (by decade, region, or theme)
  - Full archive access (subscription model)
- **No Ads:** Clean, premium experience

### **Explicitly Out of Scope for MVP** ❌

- ❌ Multiplayer/Battle Mode
- ❌ Audio clues (beat snippets, vocal samples)
- ❌ Visual clues (album covers, artist photos)
- ❌ User-generated puzzles
- ❌ Social features (sharing, comments)
- ❌ Freestyle/rhyming challenges

---

## 🏗️ Technical Architecture

### **Backend: Golang**

**Framework:** Gin (HTTP router)  
**Database:** PostgreSQL with GORM  
**Authentication:** JWT tokens  
**OAuth:** Google, Apple (using golang.org/x/oauth2)

**Key Components:**
- RESTful API
- User authentication & authorization
- Puzzle management system
- Leaderboard calculations
- Payment processing integration
- Daily challenge scheduler

### **Frontend: React Native**

**Framework:** React Native (iOS + Android)  
**State Management:** React Query + Context API  
**Navigation:** React Navigation  
**Storage:** AsyncStorage  
**UI Library:** React Native Paper or custom components  
**Audio:** React Native Sound or Expo AV

**Key Components:**
- Crossword grid renderer
- Touch-based letter input
- Offline puzzle caching
- Smooth animations
- Push notifications (daily challenges)
- Background music player with controls

### **Database Schema (High-Level)**

**Core Tables:**
- \`users\` - User accounts and authentication
- \`user_profiles\` - Extended user info and preferences (includes music settings)
- \`puzzles\` - Crossword puzzle data
- \`puzzle_attempts\` - User attempts with scores and times
- \`leaderboards\` - Weekly rankings
- \`puzzle_packs\` - Purchasable puzzle collections
- \`purchases\` - User purchase records
- \`hip_hop_facts\` - Educational content for Culture Corner
- \`daily_challenges\` - Daily puzzle rotation
- \`music_tracks\` - Original background music metadata

---

## 🔄 Reusable Components from Daily_Bible Project

### **Backend - Reuse As-Is** ✅

1. **Authentication System**
   - \`internal/handlers/auth.go\` - Login/Register/Logout handlers
   - \`internal/middleware/auth.go\` - JWT authentication middleware
   - \`internal/services/auth_service.go\` - Auth business logic
   - \`internal/services/token_service.go\` - JWT token generation/validation
   - \`internal/password/password_service.go\` - Bcrypt password hashing

2. **OAuth Integration**
   - \`internal/config/oauth.go\` - OAuth configuration
   - \`internal/handlers/oauth.go\` - OAuth handlers
   - \`internal/services/oauth_service.go\` - OAuth service layer
   - Support for Google OAuth (add Apple OAuth using same pattern)

3. **Database Infrastructure**
   - \`internal/database/connection.go\` - PostgreSQL connection with GORM
   - \`internal/database/migrations.go\` - Migration system
   - \`internal/database/migrations/\` - SQL migration files

4. **Middleware Stack**
   - \`internal/middleware/cors.go\` - CORS configuration
   - \`internal/middleware/logger.go\` - Request logging
   - \`internal/middleware/error_handler.go\` - Error handling
   - Optional auth middleware for guest/authenticated users

5. **Project Structure**
   - Repository pattern (\`internal/repository/\`) for data access
   - Service layer pattern (\`internal/services/\`) for business logic
   - Handler layer (\`internal/handlers/\`) for HTTP endpoints
   - Route organization (\`internal/routes/routes.go\`)

6. **Configuration Management**
   - \`internal/config/config.go\` - Environment variable loading
   - \`.env\` file support with godotenv
   - Config struct pattern

7. **Utilities**
   - \`internal/utils/pagination.go\` - Pagination helpers
   - Graceful shutdown handling in \`cmd/api/main.go\`

8. **DevOps**
   - \`backend/Dockerfile\` - Multi-stage Go build
   - \`backend/fly.toml\` - Fly.io deployment config
   - \`docker-compose.yml\` - Local development setup

### **Backend - Modify/Replace** 🔧

1. **Domain Models**
   - Replace \`verses\` → \`puzzles\`
   - Replace \`favorites\` → \`completed_puzzles\` or \`saved_puzzles\`
   - Replace \`verse_history\` → \`puzzle_attempts\` (with scoring, time tracking)
   - Replace \`comments\` → remove (not needed for MVP)

2. **New Models to Create**
   - \`puzzles\` - Crossword puzzle data (grid, clues, answers)
   - \`puzzle_attempts\` - User attempts with scores, completion time
   - \`leaderboards\` - Weekly rankings
   - \`puzzle_packs\` - Purchasable collections
   - \`purchases\` - Payment records
   - \`hip_hop_facts\` - Educational content
   - \`daily_challenges\` - Daily puzzle rotation

3. **New Services to Build**
   - Puzzle service (CRUD, validation)
   - Scoring service (calculate points based on time, hints used)
   - Leaderboard service (weekly calculations, rankings)
   - Payment service (Stripe/RevenueCat integration)
   - Daily challenge service (puzzle rotation logic)
   - Hint service (reveal letters, deduct points)

4. **New Handlers to Build**
   - Puzzle handlers (get puzzle, submit answer, get hint)
   - Leaderboard handlers (get rankings, user rank)
   - Purchase handlers (buy puzzle pack, verify purchase)
   - Stats handlers (user statistics, achievements)

### **Frontend - Adapt Patterns to React Native** 🔄

1. **Reusable Patterns**
   - Authentication context pattern (\`src/contexts/AuthContext.tsx\`)
   - Custom hooks pattern (\`src/hooks/useAuth.ts\`)
   - API service layer (\`src/services/api/\`)
   - Type safety with TypeScript (\`src/types/\`)
   - React Query for server state management
   - Error boundary pattern

2. **Adaptations Needed**
   - Replace React web components → React Native components
   - Replace \`localStorage\` → \`AsyncStorage\`
   - Replace \`react-router-dom\` → \`react-navigation\`
   - Replace web-specific UI → mobile-first UI
   - Add touch gestures for crossword interaction
   - Add haptic feedback for correct answers

3. **New Components to Build**
   - Crossword grid renderer (custom component)
   - Letter input system (keyboard + touch)
   - Puzzle timer component
   - Hint button with point cost display
   - Leaderboard list component
   - Daily challenge notification handler
   - Puzzle pack purchase flow
   - Background music player component
   - Music settings (toggle, volume slider)

---

## 🚀 Initial Project Setup Steps

### **Phase 1: Environment Setup** (Days 1-2)

#### **1.1 Create Project Structure**

\`\`\`bash
# Create main project directory
mkdir hh_puzzle
cd hh_puzzle

# Create backend structure
mkdir -p backend/{cmd/api,internal/{config,database,handlers,middleware,models,repository,routes,services,utils}}
mkdir -p backend/internal/database/migrations

# Create frontend structure (React Native)
npx @react-native-community/cli init HHPuzzle
mv HHPuzzle frontend

# Create docs directory

\`\`\`

#### **1.2 Initialize GitHub Repository**

**Step 1: Create Repository on GitHub.com**

1. Go to [github.com](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: \`hh_puzzle\`
4. Description: "Hip-Hop Crossword Puzzle Game - Golang Backend + React Native Frontend"
5. Choose: Public or Private
6. **DO NOT** initialize with README, .gitignore, or license (we'll add these locally)
7. Click "Create repository"

**Step 2: Initialize Git Locally**

\`\`\`bash
# In the hh_puzzle directory
git init

# Create .gitignore file
cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Backend
backend/.env
backend/api
backend/*.db
backend/backup.sql

# Frontend
frontend/node_modules/
frontend/.expo/
frontend/dist/
frontend/.expo-shared/
frontend/npm-debug.*
frontend/*.jks
frontend/*.p8
frontend/*.p12
frontend/*.key
frontend/*.mobileprovision
frontend/*.orig.*
frontend/web-build/
frontend/.env.local

# iOS
frontend/ios/Pods/
frontend/ios/build/
frontend/ios/*.xcworkspace/xcuserdata/
frontend/ios/*.xcodeproj/xcuserdata/

# Android
frontend/android/build/
frontend/android/app/build/
frontend/android/.gradle/
frontend/android/local.properties
frontend/android/*.iml
frontend/android/.idea/

# macOS
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~

# Database
*.db
*.sqlite
*.sqlite3

# Temporary files
tmp/
temp/
EOF

# Create initial README
cat > README.md << 'EOF'
# HH_Puzzle

Hip-Hop Crossword Puzzle Game

## Tech Stack
- **Backend:** Golang (Gin framework)
- **Frontend:** React Native
- **Database:** PostgreSQL

## Getting Started

See \`docs/HH_PUZZLE_INITIAL_SETUP.md\` for detailed setup instructions.

## Development Status

🚧 In Development
EOF

# Add all files
git add .

# Create initial commit
git commit -m "Initial project setup"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hh_puzzle.git

# Push to GitHub
git branch -M main
git push -u origin main
\`\`\`

**Step 3: Verify GitHub Setup**

\`\`\`bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/hh_puzzle.git (fetch)
# origin  https://github.com/YOUR_USERNAME/hh_puzzle.git (push)
\`\`\`

**Alternative: Using GitHub CLI**

If you have GitHub CLI installed, you can create the repository directly:

\`\`\`bash
# In the hh_puzzle directory
git init
git add .
git commit -m "Initial project setup"

# Create repository and push (will prompt for public/private)
gh repo create hh_puzzle --source=. --remote=origin --push
\`\`\`

#### **1.3 Initialize Backend (Golang)**

\`\`\`bash
cd backend

# Initialize Go module
go mod init hh_puzzle

# Install core dependencies
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/golang-jwt/jwt/v5
go get github.com/joho/godotenv
go get github.com/go-playground/validator/v10
go get golang.org/x/crypto/bcrypt
go get golang.org/x/oauth2
go get golang.org/x/oauth2/google
\`\`\`

#### **1.4 Initialize Frontend (React Native)**

\`\`\`bash
cd ../frontend

# Install core dependencies
npm install @react-navigation/native @react-navigation/stack
npm install @tanstack/react-query
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-toast-message
npm install react-native-sound
# OR if using Expo
# npm install expo-av

# Install iOS dependencies (if on Mac)
cd ios && pod install && cd ..
\`\`\`

#### **1.5 Setup Database**

\`\`\`bash
# Install PostgreSQL locally or use Docker
docker run --name hh_puzzle_db \\
  -e POSTGRES_USER=hh_puzzle \\
  -e POSTGRES_PASSWORD=dev_password \\
  -e POSTGRES_DB=hh_puzzle_dev \\
  -p 5432:5432 \\
  -d postgres:14
\`\`\`

#### **1.6 Create Environment Files**

**Backend \`.env\`:**
\`\`\`env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=hh_puzzle
DB_PASSWORD=dev_password
DB_NAME=hh_puzzle_dev
DB_SSLMODE=disable

# Server
PORT=8080
SERVER_ADDRESS=0.0.0.0:8080

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
\`\`\`

**Frontend \`.env\`:**
\`\`\`env
API_BASE_URL=http://localhost:8080/api
GOOGLE_CLIENT_ID=your-google-client-id
\`\`\`

---

**Status:** Initial Setup Document Complete  
**Next Document:** Detailed Database Schema & API Endpoints  
**Last Updated:** 2024
