# Chat Application - Comprehensive Codebase Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack & Libraries](#technology-stack--libraries)
4. [Security Measures](#security-measures)
5. [Authentication & Authorization](#authentication--authorization)
6. [Database Design](#database-design)
7. [Real-time Communication](#real-time-communication)
8. [API Design & Methods](#api-design--methods)
9. [Error Handling](#error-handling)
10. [Input Validation & Sanitization](#input-validation--sanitization)
11. [Performance Optimizations](#performance-optimizations)
12. [Code Quality & Best Practices](#code-quality--best-practices)
13. [Frontend Architecture](#frontend-architecture)
14. [Backend Architecture](#backend-architecture)

---

## Project Overview

This is a full-stack real-time chat application built with modern web technologies. The application supports one-on-one messaging, real-time message delivery, read receipts, message likes, and user presence indicators.

**Key Features:**
- User authentication with JWT tokens
- Real-time messaging via WebSocket (Socket.IO)
- Message read receipts
- Message likes/reactions
- User online/offline status
- Responsive design (desktop split-view, mobile single-view)
- Optimistic UI updates
- Comprehensive error handling

---

## Architecture

### System Architecture
- **Frontend**: React 19 with TypeScript, Vite build tool
- **Backend**: Node.js with Express 5, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: JWT (Access + Refresh tokens)

### Architecture Pattern
- **Client-Server Architecture** with RESTful API
- **Real-time updates** via WebSocket connections
- **Layered Architecture**:
  - Routes → Controllers → Services → Models
  - Separation of concerns with clear boundaries

---

## Technology Stack & Libraries

### Frontend Dependencies

#### Core Libraries
- **React 19.2.3**: UI library with latest features
- **React DOM 19.2.3**: React rendering for web
- **React Router DOM 7.13.0**: Client-side routing
- **TypeScript 5.8.2**: Type-safe JavaScript

#### State Management & Data Fetching
- **@tanstack/react-query 5.90.20**: 
  - Server state management
  - Automatic caching and refetching
  - Optimistic updates
  - Background synchronization

#### Real-time Communication
- **socket.io-client 4.8.3**: WebSocket client for real-time messaging

#### Build Tools
- **Vite 6.2.0**: Fast build tool and dev server
- **@vitejs/plugin-react 5.0.0**: React plugin for Vite

### Backend Dependencies

#### Core Framework
- **Express 5.2.1**: Web application framework
- **TypeScript 5.9.3**: Type-safe JavaScript

#### Database
- **Mongoose 8.22.0**: MongoDB object modeling
- **MongoDB**: NoSQL database for data persistence

#### Authentication & Security
- **jsonwebtoken 9.0.3**: JWT token generation and verification
- **bcrypt 6.0.0**: Password hashing (10 rounds)
- **helmet 8.1.0**: Security headers middleware
- **express-rate-limit 8.2.1**: Rate limiting to prevent abuse
- **cookie-parser 1.4.7**: Cookie parsing middleware
- **cors 2.8.6**: Cross-Origin Resource Sharing

#### Validation
- **zod 4.3.6**: Schema validation library
  - Runtime type checking
  - Input validation
  - Environment variable validation

#### Real-time Communication
- **socket.io 4.8.3**: WebSocket server for real-time messaging

#### Logging
- **winston 3.19.0**: Logging library
- **winston-daily-rotate-file 5.0.0**: Daily rotating log files

#### Utilities
- **dotenv 17.2.3**: Environment variable management

---

## Security Measures

### 1. Authentication Security

#### Password Security
- **bcrypt hashing**: Passwords hashed with 10 salt rounds
- **Password requirements**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, number, and special character
  - Maximum 100 characters

#### JWT Token Security
- **Access tokens**: Short-lived (15 minutes default)
- **Refresh tokens**: Longer-lived (7 days default), stored in database
- **Token rotation**: Refresh tokens are rotated on each use
- **Secure token generation**: Cryptographically secure random tokens (64 bytes hex)
- **Token storage**: 
  - Access tokens in localStorage (client)
  - Refresh tokens in HTTP-only cookies (server)

### 2. Authorization

#### Route Protection
- **Protected routes**: Middleware checks JWT token on protected endpoints
- **Token verification**: Validates token signature and expiration
- **User context**: Attaches authenticated user to request object

#### Chat Access Control
- **Participant verification**: Users can only access chats they're part of
- **Socket authentication**: WebSocket connections require valid JWT token

### 3. Input Validation & Sanitization

#### Server-side Validation
- **Zod schemas**: All inputs validated with Zod schemas
- **Type checking**: Runtime type validation
- **Field-level errors**: Detailed validation error messages

#### Client-side Validation
- **Real-time validation**: Form inputs validated before submission
- **Sanitization functions**: 
  - HTML escaping to prevent XSS
  - Text sanitization (removes control characters)
  - Name sanitization (alphanumeric + spaces/hyphens/apostrophes)
  - Email normalization (lowercase, whitespace removal)
  - Phone number sanitization (digits only)

### 4. Rate Limiting

#### Multiple Rate Limiters
- **General API limiter**: 100 requests per 15 minutes per IP
- **Authentication limiter**: 5 requests per 15 minutes per IP
  - Skips successful requests (only counts failures)
- **OTP limiter**: 5 requests per hour per IP
- **Token refresh limiter**: 30 requests per 15 minutes per IP

### 5. Security Headers (Helmet)

#### HTTP Security Headers
- **Content Security Policy (CSP)**: Restricts resource loading
- **XSS Protection**: Legacy XSS filter enabled
- **Frame Guard**: Prevents clickjacking (deny)
- **No Sniff**: Prevents MIME type sniffing
- **HSTS**: HTTP Strict Transport Security (production only)
  - Max age: 1 year
  - Include subdomains
  - Preload enabled
- **Referrer Policy**: No referrer information leaked
- **DNS Prefetch Control**: Prevents DNS prefetching

### 6. CORS Configuration

- **Development**: Allows all origins (for local development)
- **Production**: Whitelist-based origin control
- **Credentials**: Cookies and authentication headers allowed
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization

### 7. Error Handling Security

- **No sensitive data exposure**: Error messages don't leak internal details
- **Stack traces**: Only in development mode
- **Generic error messages**: Production errors are user-friendly
- **Error logging**: All errors logged for security monitoring

### 8. Database Security

- **Password field**: Excluded from queries by default (`select: false`)
- **Indexes**: Proper indexing for performance and uniqueness
- **Transactions**: Atomic operations for critical data (user creation, token management)

### 9. Environment Variable Security

- **Validation**: All environment variables validated with Zod
- **Required variables**: Missing variables cause startup failure
- **Type safety**: Environment variables are type-checked
- **Secret management**: JWT_SECRET must be at least 10 characters

---

## Authentication & Authorization

### Authentication Flow

1. **Signup**:
   - User provides name, email, mobile number, password
   - Password hashed with bcrypt (10 rounds)
   - User created in database
   - Access token and refresh token generated
   - Refresh token stored in database with expiration

2. **Login**:
   - User provides email/phone and password
   - Password verified with bcrypt
   - Access token and refresh token generated
   - Existing refresh tokens invalidated (token rotation)
   - New refresh token stored

3. **Token Refresh**:
   - Client sends refresh token (via cookie)
   - Server validates refresh token
   - Old refresh token invalidated
   - New access token and refresh token issued (rotation)
   - Prevents token reuse attacks

4. **Logout**:
   - All refresh tokens for user invalidated
   - Client clears access token

### Token Management

#### Access Tokens
- **Format**: JWT
- **Payload**: `{ userId: string }`
- **Expiration**: 15 minutes (configurable)
- **Storage**: localStorage (client-side)
- **Usage**: Included in Authorization header: `Bearer <token>`

#### Refresh Tokens
- **Format**: Cryptographically secure random string (64 bytes hex)
- **Storage**: Database (RefreshToken collection)
- **Expiration**: 7 days (configurable)
- **Delivery**: HTTP-only cookie (server-side)
- **Rotation**: New token issued on each refresh, old token invalidated

### Authorization Middleware

```typescript
// Two middleware functions:
1. protect() - Simple token verification
2. authenticateToken() - Detailed error handling with specific error messages
```

**Features**:
- Validates Bearer token format
- Verifies JWT signature
- Checks token expiration
- Attaches user to request object
- Detailed error messages for different failure scenarios

---

## Database Design

### Models

#### User Model
```typescript
{
  name: string (required, indexed)
  email: string (required, unique, indexed, text search)
  mobileNumber: string (required, unique, indexed, text search)
  password: string (required, select: false)
  timestamps: createdAt, updatedAt
}
```

**Indexes**:
- Email index (unique)
- Mobile number index (unique)
- Text index on name, email, mobileNumber (for search)

#### Chat Model
```typescript
{
  participants: ObjectId[] (required, indexed, unique)
  lastMessage: ObjectId (reference to Message)
  lastMessageAt: Date (indexed)
  deletedBy: ObjectId[] (soft delete)
  messages: [Message subdocument]
  timestamps: createdAt, updatedAt
}
```

**Indexes**:
- Participants index (unique - ensures one chat per pair)
- lastMessageAt index (descending - for sorting)
- messages.createdAt index (descending - for message queries)

#### Message Subdocument
```typescript
{
  senderId: ObjectId (required, reference to User)
  content: string
  imageUrl: string (optional)
  voiceMessageUrl: string (optional)
  voiceMessageDuration: number (optional)
  readBy: ObjectId[] (reference to User)
  likedBy: ObjectId[] (reference to User)
  timestamps: createdAt, updatedAt
}
```

#### RefreshToken Model
```typescript
{
  userId: ObjectId (required, reference to User)
  token: string (required, unique)
  expiresAt: Date (required)
  timestamps: createdAt, updatedAt
}
```

### Database Features

#### Transactions
- **Automatic transaction support detection**: Checks if MongoDB supports transactions (replica set/mongos)
- **Graceful fallback**: Works without transactions on standalone instances
- **Atomic operations**: User creation, token management use transactions when available
- **Error handling**: Automatic rollback on failure

#### Connection Management
- **Connection pooling**: Configurable pool size (min: 2, max: 10)
- **Timeouts**: Configurable connection and socket timeouts
- **Retry logic**: Automatic reconnection with configurable attempts
- **Heartbeat**: Regular connection health checks

---

## Real-time Communication

### Socket.IO Implementation

#### Connection Management
- **Authentication**: Socket connections require JWT token
- **Token verification**: Middleware validates token before connection
- **User tracking**: Active users tracked in memory (userId → socketId[])
- **Room management**: 
  - Personal rooms: `user:${userId}` for direct notifications
  - Chat rooms: `chat:${chatId}` for chat-specific events

#### Events

**Client → Server**:
- `join-chat`: Join a chat room
- `leave-chat`: Leave a chat room
- `send-message`: Send a new message
- `mark-read`: Mark messages as read
- `toggle-message-like`: Like/unlike a message
- `typing`: Send typing indicator

**Server → Client**:
- `new-message`: New message received
- `message-sent`: Confirmation of sent message
- `messages-read`: Messages marked as read
- `message-liked`: Message like status changed
- `user-online`: User came online
- `user-offline`: User went offline
- `chat-updated`: Chat metadata updated
- `chat-created`: New chat created
- `typing`: User is typing

#### Features
- **Duplicate prevention**: Prevents joining same room multiple times
- **Access control**: Verifies user is participant before joining chat
- **Auto-creation**: Creates chat if it doesn't exist when sending message
- **Broadcasting**: Efficient message delivery to all participants
- **Presence tracking**: Tracks online/offline status

---

## API Design & Methods

### REST API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup`: Create new user account
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/refresh`: Refresh access token
- `POST /api/auth/logout`: Logout user (invalidate tokens)

#### User Routes (`/api/users`)
- `GET /api/users/search?q=query`: Search users
- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update user profile

#### Chat Routes (`/api/chats`)
- `GET /api/chats`: Get user's chat list
- `GET /api/chats/:userId`: Get or create chat with user
- `GET /api/chats/:chatId/messages`: Get chat messages (pagination)
- `POST /api/chats/:chatId/messages`: Send message
- `PUT /api/chats/:chatId/read`: Mark messages as read
- `PUT /api/chats/:chatId/messages/:messageId/like`: Toggle message like
- `DELETE /api/chats/:chatId`: Delete chat

### API Service Layer (Frontend)

**ApiService Class**:
- Centralized HTTP client
- Automatic token management
- Error handling
- Request/response transformation

**Methods**:
- `login()`, `signup()`, `logout()`, `refreshToken()`
- `getUserChats()`, `getOrCreateChat()`, `getChatMessages()`
- `sendMessage()`, `markMessagesAsRead()`, `toggleMessageLike()`
- `deleteChat()`, `searchUsers()`, `updateProfile()`

### React Query Hooks

#### Data Fetching Hooks
- `useChats()`: Fetch and cache chat list
- `useMessages()`: Fetch and cache messages for a chat
- `useUsers()`: Search users

#### Mutation Hooks
- `useSendMessage()`: Send message with optimistic updates
- `useMarkMessagesAsRead()`: Mark messages as read
- `useToggleMessageLike()`: Like/unlike message
- `useDeleteChat()`: Delete chat
- `useLogin()`, `useSignup()`, `useLogout()`, `useRefreshToken()`

**Features**:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling and rollback
- Query invalidation

---

## Error Handling

### Server-side Error Handling

#### Error Classes Hierarchy
```typescript
AppError (base class)
├── ValidationError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── UnprocessableEntityError (422)
└── Domain-specific errors:
    ├── UserNotFoundError
    ├── DuplicateUserError
    ├── InvalidCredentialsError
    └── ChatNotFoundError
```

#### Error Middleware
- **Centralized error handler**: Catches all errors
- **Error type detection**: 
  - AppError instances
  - Zod validation errors
  - MongoDB duplicate key errors
  - Mongoose validation errors
  - Mongoose cast errors
  - JWT errors
  - JSON syntax errors
- **Error formatting**: Consistent error response format
- **Logging**: All errors logged with context
- **Stack traces**: Only in development mode

#### Error Response Format
```typescript
{
  error: string,        // Error type
  message: string,      // User-friendly message
  details?: Array<{     // Field-level errors (validation)
    field: string,
    message: string
  }>,
  stack?: string        // Only in development
}
```

### Client-side Error Handling

#### Error Boundary
- **React Error Boundary**: Catches React component errors
- **Fallback UI**: User-friendly error display
- **Error recovery**: Reset button to return to home

#### API Error Handling
- **Try-catch blocks**: All API calls wrapped
- **Error messages**: User-friendly error messages
- **Network errors**: Handled gracefully
- **Token errors**: Automatic token refresh on 401

#### Async Handler Wrapper
- **asyncHandler**: Wraps async route handlers
- **Automatic error catching**: Errors passed to error middleware
- **No try-catch needed**: Cleaner route handler code

---

## Input Validation & Sanitization

### Server-side Validation (Zod)

#### User Registration Schema
- Name: 2-100 characters, trimmed
- Email: Valid email format, lowercase, trimmed
- Mobile number: Exactly 10 digits
- Password: 
  - 8-100 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

#### Login Schema
- Email or phone: Valid email OR 10-digit phone number
- Password: Required

#### OTP Schema
- Email or phone: Valid email OR 10-digit phone number
- OTP: Exactly 4 digits

### Client-side Validation

#### Validation Functions
- `validateEmail()`: Email format and length
- `validatePhoneNumber()`: 10 digits, not all same
- `validateEmailOrPhone()`: Either email or phone
- `validatePassword()`: Length and complexity
- `validateName()`: Length and character restrictions
- `validateMessage()`: Length limits
- `validateBio()`: Optional, length limits
- `validateSearchQuery()`: Length limits

#### Sanitization Functions
- `sanitizeHtml()`: Escapes HTML characters (XSS prevention)
- `sanitizeText()`: Removes control characters
- `sanitizeName()`: Allows only letters, spaces, hyphens, apostrophes
- `sanitizeEmail()`: Lowercase, removes whitespace
- `sanitizePhoneNumber()`: Digits only
- `sanitizeMessage()`: HTML escaping, whitespace normalization
- `sanitizeSearchQuery()`: Removes dangerous characters
- `sanitizeUrl()`: Basic URL sanitization

---

## Performance Optimizations

### Frontend Optimizations

#### React Query Optimizations
- **Caching**: Automatic caching of API responses
- **Stale-while-revalidate**: Shows cached data while refetching
- **Background refetching**: Updates data in background
- **Query invalidation**: Smart cache invalidation
- **Optimistic updates**: Immediate UI updates before server confirmation
- **Request deduplication**: Multiple components requesting same data = single request

#### Component Optimizations
- **Lazy loading**: Routes loaded on demand
- **Memoization**: React.memo for expensive components
- **Code splitting**: Vite automatic code splitting

### Backend Optimizations

#### Database Optimizations
- **Indexes**: Strategic indexes on frequently queried fields
- **Select projection**: Only fetch required fields
- **Pagination**: Message pagination to limit data transfer
- **Connection pooling**: Reuse database connections

#### Caching Strategy
- **Active users**: In-memory cache for online users
- **Socket rooms**: Efficient room management

#### Query Optimizations
- **Lean queries**: Mongoose lean() for faster queries
- **Population**: Selective field population
- **Aggregation**: Efficient data aggregation where needed

### Real-time Optimizations
- **Room-based broadcasting**: Only send to relevant users
- **Event deduplication**: Prevents duplicate event emissions
- **Connection reuse**: Single socket connection per user

---

## Code Quality & Best Practices

### TypeScript Usage
- **Strict typing**: Full TypeScript coverage
- **Type safety**: Interfaces for all data structures
- **Generic types**: Reusable generic functions
- **Type inference**: Leverages TypeScript inference

### Code Organization
- **Separation of concerns**: Clear layer boundaries
- **Single responsibility**: Each module has one purpose
- **DRY principle**: No code duplication
- **Modular structure**: Well-organized file structure

### Error Handling Best Practices
- **Custom error classes**: Domain-specific errors
- **Error boundaries**: React error boundaries
- **Graceful degradation**: App continues working on errors
- **User-friendly messages**: No technical jargon in errors

### Security Best Practices
- **Input validation**: All inputs validated
- **Output sanitization**: All outputs sanitized
- **Password hashing**: Never store plain passwords
- **Token security**: Secure token generation and storage
- **Rate limiting**: Prevents abuse
- **Security headers**: Comprehensive security headers

### Testing Considerations
- **Testable code**: Functions are pure and testable
- **Mockable services**: Services can be easily mocked
- **Error scenarios**: Error handling is comprehensive

### Documentation
- **JSDoc comments**: Function documentation
- **Type annotations**: Self-documenting code
- **README files**: Setup and usage instructions

---

## Frontend Architecture

### Component Structure
```
client/
├── components/        # Reusable components
│   ├── ErrorBoundary.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useChats.ts
│   ├── useMessages.ts
│   └── useUsers.ts
├── screens/          # Page components
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── OTPScreen.tsx
│   ├── ProfileSetupScreen.tsx
│   ├── ChatListScreen.tsx
│   ├── ChatDetailScreen.tsx
│   └── NewMessageScreen.tsx
├── services/         # API and socket services
│   ├── api.ts
│   └── socket.ts
└── utils/           # Utility functions
    ├── validation.ts
    └── sanitization.ts
```

### State Management
- **React Context**: Authentication state
- **React Query**: Server state (chats, messages, users)
- **Local State**: Component-specific state (forms, UI state)

### Routing
- **React Router**: Client-side routing
- **Protected Routes**: Authentication required
- **Public Routes**: Authentication not required
- **Route Guards**: Automatic redirects based on auth status

### Responsive Design
- **Desktop**: Split-view layout (chat list + chat detail)
- **Mobile**: Single-view layout (one screen at a time)
- **Breakpoints**: lg breakpoint for layout switch

---

## Backend Architecture

### Project Structure
```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── db.ts        # Database connection
│   │   ├── env.ts       # Environment variables
│   │   └── socket.ts    # Socket.IO setup
│   ├── controllers/     # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── chat.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── security.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Chat.ts
│   │   ├── Message.ts
│   │   ├── OTP.ts
│   │   └── RefreshToken.ts
│   ├── routes/          # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── chatRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── chatService.ts
│   │   └── jwtService.ts
│   ├── utils/           # Utility functions
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── token.ts
│   │   └── transaction.ts
│   ├── validations/     # Zod schemas
│   │   ├── userValidation.ts
│   │   └── chatValidation.ts
│   └── index.ts         # Application entry point
└── logs/                # Log files
```

### Request Flow
1. **Request** → Express middleware (security, CORS, rate limiting)
2. **Route** → Route handler
3. **Controller** → Business logic validation
4. **Service** → Database operations
5. **Model** → Data persistence
6. **Response** → Error handling → Client

### Logging System
- **Winston logger**: Comprehensive logging
- **Log levels**: error, warn, info, http, debug
- **Daily rotation**: Log files rotated daily
- **Separate files**: 
  - Error logs
  - Combined logs
  - Exception logs
  - Rejection logs
- **Retention**: 14-30 days depending on log type
- **Compression**: Old logs compressed

---

## Key Highlights for Interview

### Technical Excellence
1. **Modern Stack**: Latest versions of React, Express, TypeScript
2. **Type Safety**: Full TypeScript coverage
3. **Security First**: Comprehensive security measures
4. **Real-time**: Efficient WebSocket implementation
5. **Performance**: Optimistic updates, caching, indexing

### Architecture Decisions
1. **Separation of Concerns**: Clear layer boundaries
2. **Error Handling**: Comprehensive error management
3. **Validation**: Multi-layer validation (client + server)
4. **Token Management**: Secure token rotation
5. **Database Design**: Proper indexing and transactions

### Best Practices
1. **Code Organization**: Modular, maintainable structure
2. **Documentation**: Well-documented code
3. **Error Messages**: User-friendly error handling
4. **Security**: Defense in depth approach
5. **Performance**: Multiple optimization strategies

### Scalability Considerations
1. **Database Indexing**: Optimized queries
2. **Connection Pooling**: Efficient resource usage
3. **Caching**: React Query caching
4. **Rate Limiting**: Prevents abuse
5. **Transaction Support**: Data consistency

---

## Conclusion

This codebase demonstrates:
- **Full-stack development** expertise
- **Security awareness** with multiple layers of protection
- **Modern best practices** in React and Node.js
- **Real-time communication** implementation
- **Type safety** with TypeScript
- **Error handling** and user experience focus
- **Performance optimization** strategies
- **Code quality** and maintainability

The application is production-ready with comprehensive security measures, error handling, and performance optimizations.
