# Backend-Frontend Integration Guide

This document outlines the integration between the backend API and the frontend UI.

## What Has Been Integrated

### 1. Authentication
- ✅ Login screen connected to `/api/auth/login`
- ✅ Signup screen connected to `/api/auth/signup`
- ✅ Token management with localStorage
- ✅ Automatic token refresh
- ✅ Auth context for global state management

### 2. User Management
- ✅ Profile setup/update connected to `/api/users/profile`
- ✅ User search connected to `/api/users/search`

### 3. Chat Features
- ✅ Chat list fetching from `/api/chats`
- ✅ Message loading from `/api/chats/:chatId/messages`
- ✅ Real-time messaging via Socket.IO
- ✅ Chat creation via `/api/chats/:userId`
- ✅ Message sending (Socket.IO + REST fallback)

### 4. Backend Improvements
- ✅ Added missing `authenticateToken` middleware
- ✅ Added proper signup service (was using login before)
- ✅ Added user profile update endpoint
- ✅ Added user search endpoint

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd Chat-app/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with required environment variables (see `server/src/config/env.ts` for all required vars):
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=your_bucket_name
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd Chat-app/client
```

2. Install dependencies:
```bash
npm install
```

This will install `socket.io-client` which is required for real-time messaging.

3. Create a `.env` file (optional, defaults are provided):
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000` (or another port if 3000 is taken)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/phone and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search?q=query` - Search users

### Chats
- `GET /api/chats` - Get all user chats
- `GET /api/chats/:userId` - Get or create chat with user
- `GET /api/chats/:chatId/messages` - Get chat messages
- `POST /api/chats/:chatId/messages` - Send message (REST fallback)
- `PUT /api/chats/:chatId/read` - Mark messages as read
- `PUT /api/chats/:chatId/messages/:messageId/like` - Toggle message like
- `DELETE /api/chats/:chatId` - Delete chat

## Socket.IO Events

### Client → Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `mark-read` - Mark messages as read
- `toggle-message-like` - Toggle like on message
- `typing` - Send typing indicator

### Server → Client
- `new-message` - New message received
- `chat-updated` - Chat metadata updated
- `user-online` - User online status changed
- `messages-read` - Messages marked as read
- `message-liked` - Message like status changed
- `typing` - User typing indicator
- `error` - Error occurred

## Notes

1. **OTP Screen**: Currently skipped in the flow. The backend has OTP functionality for password reset, but not for login/signup verification. You can add this later if needed.

2. **User Model**: The User model doesn't have a `bio` or `picture` field yet. You may need to add these fields to the User schema if you want full profile functionality.

3. **Socket Authentication**: Socket connections require a valid JWT token passed in `auth.token` or `Authorization` header.

4. **CORS**: The backend is configured to accept requests from any origin in development. Make sure to configure CORS properly for production.

5. **Error Handling**: All API calls include error handling and display error messages to users.

## Testing the Integration

1. Start both backend and frontend servers
2. Navigate to the frontend URL
3. Try signing up a new user
4. Complete profile setup
5. Search for users and create chats
6. Send messages and verify real-time updates

## Troubleshooting

- **Socket connection fails**: Check that the backend is running and the token is valid
- **API calls fail**: Verify the backend URL in `.env` matches your server
- **CORS errors**: Ensure backend CORS is configured correctly
- **Token errors**: Check JWT_SECRET is set correctly in backend `.env`
