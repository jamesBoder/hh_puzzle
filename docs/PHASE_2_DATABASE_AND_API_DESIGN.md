# HH_Puzzle - Phase 2: Database Schema & API Design
## Detailed Technical Specification

**Project:** HH_Puzzle (Hip-Hop Crossword Puzzle Game)  
**Phase:** 2 - Database & API Architecture  
**Prerequisites:** Phase 1 (Initial Setup) Complete ✅  
**Timeline:** Week 1-2 of Development  
**Status:** Ready to Execute

---

## 📋 Phase 2 Overview

Now that the initial project structure and database are set up, this phase focuses on:

1. **Database Schema Design** - Complete table structures with relationships
2. **API Endpoint Specification** - RESTful API design
3. **Data Models Implementation** - Go structs with GORM tags
4. **Migration Files** - SQL migration scripts
5. **Repository Layer** - Data access patterns
6. **Service Layer Foundation** - Business logic structure

---

## 🗄️ Complete Database Schema

### **1. Users & Authentication Tables**

#### **users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    username VARCHAR(50) UNIQUE NOT NULL,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_deleted_at (deleted_at)
);
```

#### **user_profiles**
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    total_points INTEGER DEFAULT 0,
    puzzles_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_puzzle_date DATE,
    
    -- Music preferences
    music_enabled BOOLEAN DEFAULT TRUE,
    music_volume INTEGER DEFAULT 70, -- 0-100
    
    -- Preferences
    difficulty_preference VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, expert
    theme VARCHAR(20) DEFAULT 'dark', -- dark, light
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_total_points (total_points DESC)
);
```

#### **oauth_accounts**
```sql
CREATE TABLE oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'apple'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider, provider_user_id),
    INDEX idx_oauth_user_id (user_id),
    INDEX idx_oauth_provider (provider, provider_user_id)
);
```

---

### **2. Puzzle System Tables**

#### **puzzles**
```sql
CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Grid data (stored as JSON)
    grid_data JSONB NOT NULL, -- {width: 15, height: 15, cells: [...]}
    clues_across JSONB NOT NULL, -- [{number: 1, clue: "...", answer: "..."}]
    clues_down JSONB NOT NULL,
    
    -- Categorization
    difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'expert'
    decade VARCHAR(10), -- '80s', '90s', '2000s', '2010s', '2020s'
    region VARCHAR(50), -- 'NYC', 'LA', 'Atlanta', 'Chicago', etc.
    subgenre VARCHAR(50), -- 'Trap', 'Boom Bap', 'Conscious Rap', etc.
    
    -- Metadata
    estimated_time INTEGER, -- in minutes
    base_points INTEGER DEFAULT 100,
    is_daily_challenge BOOLEAN DEFAULT FALSE,
    daily_challenge_date DATE UNIQUE, -- NULL if not a daily challenge
    
    -- Pack association
    puzzle_pack_id INTEGER REFERENCES puzzle_packs(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_puzzles_difficulty (difficulty),
    INDEX idx_puzzles_decade (decade),
    INDEX idx_puzzles_region (region),
    INDEX idx_puzzles_daily_challenge (is_daily_challenge, daily_challenge_date),
    INDEX idx_puzzles_pack (puzzle_pack_id),
    INDEX idx_puzzles_deleted_at (deleted_at)
);
```

#### **puzzle_attempts**
```sql
CREATE TABLE puzzle_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_state JSONB, -- Current grid state with user's answers
    is_completed BOOLEAN DEFAULT FALSE,
    completion_time INTEGER, -- in seconds
    
    -- Scoring
    hints_used INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2), -- 0.00 to 100.00
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, puzzle_id), -- One attempt per user per puzzle
    
    -- Indexes
    INDEX idx_attempts_user_id (user_id),
    INDEX idx_attempts_puzzle_id (puzzle_id),
    INDEX idx_attempts_completed (is_completed, completed_at),
    INDEX idx_attempts_points (points_earned DESC)
);
```

#### **puzzle_packs**
```sql
CREATE TABLE puzzle_packs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Categorization (same as puzzles for filtering)
    category_type VARCHAR(50) NOT NULL, -- 'decade', 'region', 'subgenre', 'mixed'
    category_value VARCHAR(50), -- '90s', 'NYC', 'Trap', etc.
    
    -- Pricing
    price_usd DECIMAL(10,2) NOT NULL,
    is_subscription BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    puzzle_count INTEGER DEFAULT 0,
    cover_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_packs_category (category_type, category_value),
    INDEX idx_packs_active (is_active)
);
```

---

### **3. Leaderboard & Achievements Tables**

#### **leaderboards**
```sql
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Time period
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Stats for the week
    total_points INTEGER DEFAULT 0,
    puzzles_completed INTEGER DEFAULT 0,
    average_completion_time INTEGER, -- in seconds
    
    -- Ranking
    rank INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, week_start_date),
    
    -- Indexes
    INDEX idx_leaderboard_week (week_start_date, week_end_date),
    INDEX idx_leaderboard_rank (week_start_date, rank),
    INDEX idx_leaderboard_user (user_id)
);
```

#### **hip_hop_facts**
```sql
CREATE TABLE hip_hop_facts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50), -- 'history', 'artist', 'terminology', 'production'
    
    -- Unlock conditions
    unlock_type VARCHAR(50), -- 'puzzle_completion', 'points_milestone', 'streak'
    unlock_value INTEGER, -- puzzle_id, points threshold, or streak count
    
    -- Media
    image_url VARCHAR(500),
    source_url VARCHAR(500), -- Reference link
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_facts_category (category),
    INDEX idx_facts_unlock (unlock_type, unlock_value)
);
```

#### **user_unlocked_facts**
```sql
CREATE TABLE user_unlocked_facts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fact_id INTEGER NOT NULL REFERENCES hip_hop_facts(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, fact_id),
    
    -- Indexes
    INDEX idx_unlocked_user (user_id),
    INDEX idx_unlocked_fact (fact_id)
);
```

---

### **4. Monetization Tables**

#### **purchases**
```sql
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_pack_id INTEGER REFERENCES puzzle_packs(id) ON DELETE SET NULL,
    
    -- Payment details
    amount_usd DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_provider VARCHAR(50), -- 'stripe', 'apple', 'google'
    transaction_id VARCHAR(255) UNIQUE,
    
    -- Subscription details (if applicable)
    is_subscription BOOLEAN DEFAULT FALSE,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_status VARCHAR(50), -- 'active', 'cancelled', 'expired'
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_purchases_user (user_id),
    INDEX idx_purchases_pack (puzzle_pack_id),
    INDEX idx_purchases_transaction (transaction_id),
    INDEX idx_purchases_subscription (is_subscription, subscription_status)
);
```

---

### **5. Music System Tables**

#### **music_tracks**
```sql
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200), -- Developer name or "HH_Puzzle Original"
    
    -- File information
    file_url VARCHAR(500) NOT NULL,
    file_size_kb INTEGER,
    duration_seconds INTEGER,
    
    -- Metadata
    genre VARCHAR(50) DEFAULT 'hip-hop',
    mood VARCHAR(50), -- 'chill', 'energetic', 'focused'
    bpm INTEGER,
    
    -- Usage
    is_active BOOLEAN DEFAULT TRUE,
    play_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tracks_active (is_active),
    INDEX idx_tracks_mood (mood)
);
```

---

## 🔗 Database Relationships Summary

```
users (1) ──→ (1) user_profiles
users (1) ──→ (N) oauth_accounts
users (1) ──→ (N) puzzle_attempts
users (1) ──→ (N) leaderboards
users (1) ──→ (N) purchases
users (1) ──→ (N) user_unlocked_facts

puzzles (1) ──→ (N) puzzle_attempts
puzzles (N) ──→ (1) puzzle_packs

puzzle_packs (1) ──→ (N) purchases

hip_hop_facts (1) ──→ (N) user_unlocked_facts
```

---

## 🛣️ Complete API Endpoint Specification

### **Base URL:** `http://localhost:8080/api/v1`

---

### **1. Authentication Endpoints**

#### **POST /auth/register**
Register a new user with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "hiphopfan"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "hiphopfan",
    "is_guest": false
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### **POST /auth/login**
Login with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "hiphopfan",
    "profile": {
      "display_name": "Hip Hop Fan",
      "total_points": 1250,
      "puzzles_completed": 15
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### **POST /auth/guest**
Create a guest account (no email/password)

**Request:** (empty body)

**Response (201):**
```json
{
  "user": {
    "id": 2,
    "username": "guest_abc123",
    "is_guest": true
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### **POST /auth/google**
Initiate Google OAuth flow

**Response (200):**
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

#### **GET /auth/google/callback**
Google OAuth callback

**Query Params:** `code`, `state`

**Response (302):** Redirect to frontend with token

---

### **2. Puzzle Endpoints**

#### **GET /puzzles/daily**
Get today's daily challenge (available to all users including guests)

**Response (200):**
```json
{
  "puzzle": {
    "id": 42,
    "title": "90s Golden Era",
    "description": "Test your knowledge of 90s hip-hop classics",
    "difficulty": "intermediate",
    "decade": "90s",
    "grid_data": {
      "width": 15,
      "height": 15,
      "cells": [...]
    },
    "clues_across": [
      {"number": 1, "clue": "Notorious B.I.G.'s debut album (5,2,5)"},
      {"number": 5, "clue": "Wu-Tang Clan's home borough"}
    ],
    "clues_down": [
      {"number": 1, "clue": "Dr. Dre's 1992 solo debut"},
      {"number": 2, "clue": "Tupac's record label"}
    ],
    "estimated_time": 20,
    "base_points": 100,
    "is_daily_challenge": true
  },
  "user_attempt": null // or attempt object if user has started
}
```

---

#### **GET /puzzles/:id**
Get a specific puzzle (requires authentication for non-daily puzzles)

**Headers:** `Authorization: Bearer <token>` (optional for daily challenge)

**Response (200):** Same as daily puzzle

**Response (403):** If puzzle is in a pack user hasn't purchased

---

#### **GET /puzzles**
List available puzzles with filters

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `difficulty` - beginner, intermediate, expert
- `decade` - 80s, 90s, 2000s, 2010s, 2020s
- `region` - NYC, LA, Atlanta, etc.
- `subgenre` - Trap, Boom Bap, etc.
- `page` - pagination
- `limit` - results per page

**Response (200):**
```json
{
  "puzzles": [
    {
      "id": 1,
      "title": "Trap Kings",
      "difficulty": "intermediate",
      "decade": "2010s",
      "region": "Atlanta",
      "is_locked": false,
      "user_completed": true,
      "user_score": 85
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

#### **POST /puzzles/:id/start**
Start a puzzle attempt

**Headers:** `Authorization: Bearer <token>`

**Response (201):**
```json
{
  "attempt": {
    "id": 123,
    "puzzle_id": 42,
    "current_state": {
      "grid": [...], // empty grid
      "filled_cells": 0
    },
    "started_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### **PUT /puzzles/:id/save**
Save puzzle progress

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "current_state": {
    "grid": [...], // partially filled grid
    "filled_cells": 25
  }
}
```

**Response (200):**
```json
{
  "attempt": {
    "id": 123,
    "updated_at": "2024-01-15T10:45:00Z"
  }
}
```

---

#### **POST /puzzles/:id/submit**
Submit completed puzzle

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "answers": {
    "1_across": "READY TO DIE",
    "5_across": "STATEN ISLAND",
    "1_down": "THE CHRONIC",
    "2_down": "DEATH ROW"
  }
}
```

**Response (200):**
```json
{
  "result": {
    "is_correct": true,
    "accuracy": 100.0,
    "completion_time": 1245, // seconds
    "hints_used": 2,
    "points_earned": 85,
    "new_total_points": 1335,
    "unlocked_facts": [
      {
        "id": 5,
        "title": "The Chronic's Impact",
        "content": "..."
      }
    ]
  }
}
```

---

#### **POST /puzzles/:id/hint**
Request a hint (reveals first letter of a word)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "clue_number": 1,
  "direction": "across" // or "down"
}
```

**Response (200):**
```json
{
  "hint": {
    "first_letter": "R",
    "points_deducted": 5,
    "remaining_points": 95
  }
}
```

---

### **3. Leaderboard Endpoints**

#### **GET /leaderboard/weekly**
Get current week's leaderboard

**Query Params:**
- `page` - pagination
- `limit` - results per page (default: 50)

**Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "username": "hiphopmaster",
        "display_name": "Hip Hop Master",
        "avatar_url": "..."
      },
      "total_points": 2500,
      "puzzles_completed": 35,
      "average_time": 780
    }
  ],
  "current_user_rank": {
    "rank": 42,
    "total_points": 1250,
    "puzzles_completed": 15
  },
  "week_period": {
    "start": "2024-01-15",
    "end": "2024-01-21"
  }
}
```

---

### **4. User Profile Endpoints**

#### **GET /profile**
Get current user's profile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "hiphopfan",
    "profile": {
      "display_name": "Hip Hop Fan",
      "avatar_url": "...",
      "total_points": 1250,
      "puzzles_completed": 15,
      "current_streak": 5,
      "longest_streak": 12,
      "music_enabled": true,
      "music_volume": 70
    }
  }
}
```

---

#### **PUT /profile**
Update user profile

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "display_name": "New Name",
  "avatar_url": "https://...",
  "music_enabled": false,
  "music_volume": 50
}
```

**Response (200):** Updated profile object

---

#### **GET /profile/stats**
Get detailed user statistics

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "stats": {
    "total_points": 1250,
    "puzzles_completed": 15,
    "current_streak": 5,
    "longest_streak": 12,
    "average_completion_time": 850,
    "total_hints_used": 23,
    "by_difficulty": {
      "beginner": {"completed": 8, "avg_time": 600},
      "intermediate": {"completed": 5, "avg_time": 900},
      "expert": {"completed": 2, "avg_time": 1500}
    },
    "unlocked_facts_count": 12
  }
}
```

---

### **5. Puzzle Pack & Purchase Endpoints**

#### **GET /packs**
List available puzzle packs

**Response (200):**
```json
{
  "packs": [
    {
      "id": 1,
      "name": "90s Golden Era Collection",
      "description": "25 puzzles from the golden age",
      "category_type": "decade",
      "category_value": "90s",
      "price_usd": 4.99,
      "puzzle_count": 25,
      "is_purchased": false
    }
  ]
}
```

---

#### **POST /purchases**
Purchase a puzzle pack

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "puzzle_pack_id": 1,
  "payment_provider": "stripe",
  "payment_token": "tok_..."
}
```

**Response (201):**
```json
{
  "purchase": {
    "id": 456,
    "puzzle_pack_id": 1,
    "amount_usd": 4.99,
    "status": "completed",
    "transaction_id": "ch_..."
  }
}
```

---

### **6. Culture Corner Endpoints**

#### **GET /facts**
Get unlocked hip-hop facts

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "facts": [
    {
      "id": 1,
      "title": "The Birth of Hip-Hop",
      "content": "Hip-hop was born on August 11, 1973...",
      "category": "history",
      "image_url": "...",
      "unlocked_at": "2024-01-10T15:30:00Z"
    }
  ]
}
```

---

### **7. Music Endpoints**

#### **GET /music/tracks**
Get available background music tracks

**Response (200):**
```json
{
  "tracks": [
    {
      "id": 1,
      "title": "Puzzle Flow",
      "artist": "HH_Puzzle Original",
      "file_url": "https://cdn.../track1.mp3",
      "duration_seconds": 180,
      "mood": "focused"
    }
  ]
}
```

---

## 📝 Next Steps for Implementation

### **Week 1: Database & Models**

**Day 1-2: Database Setup**
- [ ] Create all migration files
- [ ] Run migrations on local PostgreSQL
- [ ] Verify table creation and relationships

**Day 3-4: Go Models**
- [ ] Create GORM models for all tables
- [ ] Add validation tags
- [ ] Test model relationships

**Day 5: Repository Layer**
- [ ] Implement repository interfaces
- [ ] Create repository implementations
- [ ] Write basic CRUD operations

### **Week 2: API Implementation**

**Day 1-2: Authentication**
- [ ] Implement auth handlers
- [ ] Set up JWT middleware
- [ ] Test login/register flows

**Day 3-4: Puzzle System**
- [ ] Implement puzzle handlers
- [ ] Create puzzle attempt logic
- [ ] Build scoring system

**Day 5: Testing & Documentation**
- [ ] Test all endpoints with Postman
- [ ] Document API with examples
- [ ] Fix bugs and edge cases

---

## ✅ Success Criteria

- [ ] All database tables created successfully
- [ ] All relationships working correctly
- [ ] All API endpoints implemented
- [ ] Authentication working (email + guest)
- [ ] Daily puzzle system functional
- [ ] Scoring and leaderboard logic working
- [ ] API documentation complete
- [ ] Ready for frontend integration

---

**Status:** Ready to Begin Implementation  
**Next Document:** Phase 3 - Frontend Development (React Native)  
**Last Updated:** 2024
