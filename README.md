# P-Verse

A modern social networking platform built with Spring Boot and Next.js, featuring real-time messaging and interactive social features.

## Overview

P-Verse is a full-stack social media application that enables users to connect, share moments, and communicate in real-time. The platform combines a robust Java backend with a responsive React frontend to deliver a seamless social networking experience.

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security with JWT authentication
- Spring WebSocket (STOMP protocol)
- Spring Data JPA
- MySQL Database
- Maven

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ShadcN UI Components
- Socket.IO Client (STOMP over WebSocket)

## Features

### Completed Features

#### Account Management
- User registration with email and password
- Secure authentication using JWT tokens
- Profile editing (username, bio, avatar, privacy settings)
- Account deletion

#### Social Connections
- User search functionality
- Send and accept friend requests
- Friend list management
- Privacy controls for posts and profile

#### Content Creation & Interaction
- Create posts (moments) with images
- Share posts with all friends or specific friends
- Edit and delete your own posts
- Comment on friends' posts
- React to posts (like, love, etc.)
- Photo comments sent directly to message inbox (Locket-style)
- Save posts for later viewing

#### Real-Time Messaging
- One-to-one instant messaging
- WebSocket-based real-time communication
- Send text messages and images
- Message history persistence
- Conversation list sorted by most recent activity
- Message preview in conversation list
- Messenger popup for quick conversations

#### Personalization & Settings
- Light/dark theme toggle
- Language selection (English/Vietnamese)
- Privacy settings for profile and posts
- Notification preferences
- Account switcher for multiple accounts

### Pending Features

#### Group Chat
- Create and manage group conversations
- Add/remove members from groups
- Group messaging with multiple participants

#### Rich Media Support
- Audio file sharing (MP3)
- Video file sharing (MP4)
- Link previews with metadata
- Support for various media formats

#### Enhanced Personalization
- Custom themes and color schemes
- Font size adjustments
- More granular privacy controls
- Advanced notification settings

## Project Structure

```
P-Verse/
├── backend/                  # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/pverse/
│   │   │   │       ├── config/       # Security, WebSocket, CORS configs
│   │   │   │       ├── controller/   # REST API endpoints
│   │   │   │       ├── dto/          # Data Transfer Objects
│   │   │   │       ├── entity/       # JPA entities
│   │   │   │       ├── repository/   # Data access layer
│   │   │   │       ├── service/      # Business logic
│   │   │   │       └── exception/    # Custom exceptions
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   │   ├── (auth)/          # Authentication pages
│   │   └── (protected)/     # Protected routes
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   └── settings/        # Settings components
│   ├── lib/
│   │   ├── api/             # API client functions
│   │   ├── auth/            # Authentication context
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # WebSocket & other services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── data/                     # User uploaded files
│   └── uploads/
│       ├── avatars/
│       ├── messages/
│       ├── moments/
│       └── posts/
│
└── README.md
```

## Getting Started

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher
- npm or pnpm package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Configure the database connection in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pverse
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Build and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

Alternatively, you can run the application directly from your IDE by running the `PverseApplication` class.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Configure the API endpoint in `lib/api.ts` if needed (default is `http://localhost:8080`).

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The frontend application will start on `http://localhost:3000`

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE pverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. The application will automatically create the necessary tables on first run using JPA/Hibernate.

## API Documentation

The backend exposes RESTful APIs for:

- `/api/auth/*` - Authentication endpoints (login, register)
- `/api/users/*` - User management endpoints
- `/api/friends/*` - Friend request and relationship management
- `/api/posts/*` - Post creation and management
- `/api/moments/*` - Moment (story) functionality
- `/api/chat/*` - Message and conversation endpoints
- `/api/comments/*` - Comment management
- `/api/reactions/*` - Post reaction endpoints

WebSocket endpoint:
- `/ws` - STOMP WebSocket connection for real-time messaging

## Development Notes

### Authentication Flow
1. User logs in with username and password
2. Backend validates credentials and generates JWT token
3. Token is stored in localStorage and sent with subsequent requests
4. WebSocket connections are authenticated using the JWT token

### Real-Time Messaging
- Uses STOMP protocol over WebSocket
- Messages are sent to `/app/chat.send`
- Users subscribe to `/topic/chat/{userId}` for incoming messages
- Messages are persisted to database before broadcasting

### File Uploads
- Images are stored in the `data/uploads/` directory
- Filenames are UUID-based to prevent conflicts
- Supported formats: JPEG, PNG, GIF

## Contributing

This is a public group project. If you have suggestions or find bugs, please feel free to open an issue.

## License

This project is for educational purposes.

## Contact

For questions or feedback, please contact the project maintainers on facebook:

- [Nguyen Tien Dat](https://web.facebook.com/nguyen.tien.at.196113)
- [Nguyen Van Hoang](https://web.facebook.com/hoang.nguyen.82831)
- [Nguyen Tuan An](https://web.facebook.com/an.nguyeen.523318)