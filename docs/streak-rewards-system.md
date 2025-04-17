# Streak Rewards & Achievement System

The StrangerWave Streak Rewards and Achievement System is designed to increase user engagement and retention through gamification. This document outlines the implementation details of the system.

## System Components

The streak and achievement system consists of the following components:

1. **Streak Tracking**
   - Login Streaks: Track consecutive days a user logs in
   - Chat Streaks: Track consecutive days a user completes a chat session
   
2. **Achievements**
   - Milestone achievements based on streak counts
   - Special achievements for specific user behaviors
   - Badges for reaching significant milestones
   
3. **Trust Levels**
   - Progression system based on achievement points
   - Unlocks additional features and benefits

## Database Schema

The system uses the following database tables:

### User Streaks

Tracks different types of streaks for each user:

- `userStreaks`: Stores streak data for different streak types
  - `userId`: The user ID
  - `streakType`: Type of streak ('login', 'chat')
  - `currentStreak`: Current consecutive count
  - `longestStreak`: Highest streak ever achieved
  - `lastUpdateDate`: Date of the last streak update
  - `streakStartDate`: When the current streak began
  - `protectionUsed`: Whether streak protection was used

### Achievements

Defines the available achievements:

- `achievements`: Stores all achievement definitions
  - `id`: Achievement ID
  - `code`: Unique code for the achievement
  - `name`: Display name
  - `description`: Explanation of how to earn it
  - `category`: Type of achievement (streak, milestone, quality, special)
  - `points`: Points awarded for earning
  - `icon`: Icon representing the achievement
  - `tier`: Difficulty tier (bronze, silver, gold, platinum)

### User Achievements

Tracks which achievements each user has earned:

- `userAchievements`: Links users to their earned achievements
  - `userId`: User ID
  - `achievementId`: Achievement ID
  - `earnedAt`: When the achievement was earned
  - `displayed`: Whether achievement has been shown to user

## API Endpoints

### Streak Endpoints

- **GET** `/api/users/:id/streaks`  
  Retrieves all streaks for a user
  
- **GET** `/api/users/:id/streaks/:type`  
  Retrieves a specific streak for a user
  
- **POST** `/api/users/:id/streaks/login/update`  
  Updates a user's login streak
  
- **POST** `/api/users/:id/streaks/chat/update`  
  Updates a user's chat streak

### Achievement Endpoints

- **GET** `/api/users/:id/achievements`  
  Retrieves all achievements earned by a user
  
- **GET** `/api/users/:id/achievements/new`  
  Retrieves newly earned achievements that haven't been displayed to the user
  
- **POST** `/api/users/:userId/achievements/:achievementId/display`  
  Marks an achievement as displayed to the user
  
- **GET** `/api/achievements`  
  Retrieves all achievements (can filter by category)

## Implementation Details

### Streak Tracking Logic

1. **Login Streaks**:
   - Updated each time a user logs in
   - If login occurs within 24-48 hours of last login, streak continues
   - Reset if more than 48 hours since last login
   - Premium users get streak protection that prevents resets

2. **Chat Streaks**:
   - Updated when a user completes a chat session lasting at least 30 seconds
   - Uses same time window rules as login streaks
   - Encourages daily engagement with the platform

### Achievement Checking

Achievement checks are triggered at specific moments:

1. When a user logs in (login streak achievements)
2. When a chat session ends (chat streak achievements)
3. When certain user actions are performed (special achievements)

### Trust Levels

Users progress through five trust levels based on accumulated achievements:

1. **New User** (0-50 points)
2. **Trusted** (51-200 points)
3. **Established** (201-500 points)
4. **Respected** (501-1000 points)
5. **Exemplary** (1001+ points)

Higher trust levels provide benefits like:
- Improved match priority
- Access to exclusive features
- Reduced moderation restrictions
- Special UI treatments

## Integration Points

The streak and achievement system integrates with:

1. **Authentication Flow**: Updates login streaks when a user logs in
2. **Chat System**: Updates chat streaks when sessions end
3. **UI Components**: Displays achievement notifications
4. **Profile System**: Shows achievements on user profiles
5. **Matching Algorithm**: Uses trust level as a factor in matching

## Technical Implementation

The system is implemented with:

- TypeScript for type safety
- PostgreSQL for data storage
- RESTful API endpoints for client interaction
- WebSocket notifications for real-time achievement updates

## Future Enhancements

Planned enhancements to the system include:

1. Seasonal achievements with special rewards
2. Achievement sharing on social media
3. Achievement leaderboards by category
4. Exchange of achievement points for virtual items or premium features
5. Achievement progress tracking for in-progress achievements