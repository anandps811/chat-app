# Chat Application - Interview Quick Reference

## Quick Stats
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (Access + Refresh tokens)

---

## Key Libraries & Why They're Used

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 19.2.3 | UI framework |
| React Query | 5.90.20 | Server state, caching, optimistic updates |
| React Router | 7.13.0 | Client-side routing |
| Socket.IO Client | 4.8.3 | Real-time WebSocket communication |
| TypeScript | 5.8.2 | Type safety |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Express | 5.2.1 | Web framework |
| Mongoose | 8.22.0 | MongoDB ODM |
| Socket.IO | 4.8.3 | WebSocket server |
| JWT | 9.0.3 | Token-based authentication |
| bcrypt | 6.0.0 | Password hashing (10 rounds) |
| Zod | 4.3.6 | Schema validation |
| Helmet | 8.1.0 | Security headers |
| express-rate-limit | 8.2.1 | Rate limiting |
| Winston | 3.19.0 | Logging |

---

## Security Measures (Top 10)

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Short-lived access tokens (15min) + refresh tokens (7 days)
3. **Token Rotation**: Refresh tokens rotated on each use
4. **Rate Limiting**: Multiple limiters (auth: 5/15min, general: 100/15min)
5. **Input Validation**: Zod schemas on server, custom validators on client
6. **Input Sanitization**: XSS prevention (HTML escaping, character filtering)
7. **Security Headers**: Helmet (CSP, HSTS, XSS protection, frame guard)
8. **CORS**: Whitelist-based in production
9. **Error Handling**: No sensitive data exposure
10. **Database Security**: Passwords excluded from queries, proper indexing

---

## Authentication Flow

```
Signup → Hash Password → Create User → Generate Tokens → Store Refresh Token
Login → Verify Password → Generate Tokens → Invalidate Old Refresh Tokens
Refresh → Validate Refresh Token → Rotate Tokens → Issue New Tokens
Logout → Invalidate All Refresh Tokens
```

**Token Storage**:
- Access Token: localStorage (client)
- Refresh Token: HTTP-only cookie (server)

---

## Database Models

### User
- name, email (unique), mobileNumber (unique), password (hashed)
- Indexes: email, mobileNumber, text search

### Chat
- participants (unique pair), lastMessage, lastMessageAt
- messages: [senderId, content, imageUrl, voiceMessageUrl, readBy, likedBy]
- Indexes: participants (unique), lastMessageAt, messages.createdAt

### RefreshToken
- userId, token (unique), expiresAt
- Used for token rotation

---

## Real-time Events (Socket.IO)

### Client → Server
- `join-chat`, `leave-chat`, `send-message`, `mark-read`, `toggle-message-like`, `typing`

### Server → Client
- `new-message`, `message-sent`, `messages-read`, `message-liked`, `user-online`, `user-offline`, `chat-updated`, `chat-created`

**Features**:
- JWT authentication on connection
- Room-based broadcasting (user rooms, chat rooms)
- Duplicate join prevention
- Access control verification

---

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Chats
- `GET /api/chats` - Get chat list
- `GET /api/chats/:userId` - Get/create chat
- `GET /api/chats/:chatId/messages` - Get messages (paginated)
- `POST /api/chats/:chatId/messages` - Send message
- `PUT /api/chats/:chatId/read` - Mark as read
- `PUT /api/chats/:chatId/messages/:messageId/like` - Toggle like
- `DELETE /api/chats/:chatId` - Delete chat

### Users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

---

## Error Handling Strategy

### Server
- Custom error classes (AppError hierarchy)
- Centralized error middleware
- Type-specific error formatting (Zod, MongoDB, JWT)
- Detailed logging with Winston
- User-friendly error messages

### Client
- React Error Boundary
- Try-catch in API calls
- Automatic token refresh on 401
- Optimistic update rollback on errors

---

## Performance Optimizations

### Frontend
- React Query caching and background refetching
- Optimistic UI updates
- Request deduplication
- Code splitting (Vite)

### Backend
- Database indexes on frequently queried fields
- Connection pooling (min: 2, max: 10)
- Message pagination
- Lean queries (Mongoose)
- In-memory active user cache

---

## Code Architecture

### Frontend Structure
```
components/ → Reusable UI components
contexts/ → React contexts (Auth)
hooks/ → Custom hooks (useAuth, useChats, useMessages)
screens/ → Page components
services/ → API and Socket services
utils/ → Validation and sanitization
```

### Backend Structure
```
config/ → Database, environment, socket setup
controllers/ → Route handlers
middleware/ → Auth, error handling, rate limiting, security
models/ → Mongoose schemas
routes/ → Route definitions
services/ → Business logic
utils/ → Errors, logger, tokens, transactions
validations/ → Zod schemas
```

---

## Key Features

1. **Real-time Messaging**: Socket.IO WebSocket
2. **Read Receipts**: Track message read status
3. **Message Likes**: Like/unlike messages
4. **User Presence**: Online/offline status
5. **Responsive Design**: Desktop split-view, mobile single-view
6. **Optimistic Updates**: Immediate UI feedback
7. **Token Refresh**: Automatic token renewal
8. **Input Validation**: Multi-layer validation
9. **Error Recovery**: Graceful error handling
10. **Security**: Comprehensive security measures

---

## Interview Talking Points

### Why React Query?
- Automatic caching reduces API calls
- Optimistic updates improve UX
- Background refetching keeps data fresh
- Request deduplication prevents duplicate calls

### Why Socket.IO?
- Real-time bidirectional communication
- Automatic reconnection handling
- Room-based broadcasting for efficiency
- Built-in authentication support

### Why Zod?
- Runtime type checking
- Schema validation
- Type inference for TypeScript
- Detailed error messages

### Why bcrypt?
- Industry standard for password hashing
- Configurable salt rounds (10 rounds used)
- Slow by design (prevents brute force)

### Why JWT with Refresh Tokens?
- Stateless authentication (scalable)
- Short-lived access tokens (security)
- Refresh token rotation (prevents reuse attacks)
- HTTP-only cookies for refresh tokens (XSS protection)

### Why MongoDB?
- Flexible schema for chat messages
- Efficient for nested documents (messages in chats)
- Horizontal scalability
- Good performance for read-heavy workloads

---

## Common Interview Questions & Answers

**Q: How do you handle authentication?**
A: JWT-based authentication with access tokens (15min) and refresh tokens (7 days). Refresh tokens are rotated on each use and stored in HTTP-only cookies. Access tokens in localStorage.

**Q: How do you prevent XSS attacks?**
A: Input sanitization (HTML escaping), Content Security Policy headers, output encoding, and React's built-in XSS protection.

**Q: How do you handle real-time updates?**
A: Socket.IO for WebSocket connections. Room-based broadcasting (user rooms and chat rooms) for efficient message delivery. JWT authentication on socket connections.

**Q: How do you ensure data consistency?**
A: MongoDB transactions for critical operations (user creation, token management). Atomic operations where possible. Proper error handling and rollback.

**Q: How do you handle errors?**
A: Custom error classes with specific status codes. Centralized error middleware. User-friendly error messages. Comprehensive logging with Winston.

**Q: How do you optimize performance?**
A: Database indexes, connection pooling, React Query caching, optimistic updates, message pagination, lean queries, and in-memory caching for active users.

**Q: How do you validate user input?**
A: Multi-layer validation: client-side validation for UX, server-side Zod schemas for security. Input sanitization to prevent injection attacks.

**Q: How do you prevent brute force attacks?**
A: Rate limiting on authentication endpoints (5 requests per 15 minutes). Password hashing with bcrypt (slow by design). Account lockout considerations.

**Q: How do you handle token expiration?**
A: Automatic token refresh using refresh tokens. Background refresh on app load. Token rotation prevents reuse attacks.

**Q: How do you scale this application?**
A: Horizontal scaling with stateless JWT tokens. Database indexing for performance. Connection pooling. Caching strategies. Load balancing ready.

---

## Production Readiness Checklist

✅ Environment variable validation
✅ Security headers (Helmet)
✅ Rate limiting
✅ Input validation and sanitization
✅ Error handling and logging
✅ Database transactions
✅ Token rotation
✅ CORS configuration
✅ Password hashing
✅ Type safety (TypeScript)
✅ Error boundaries
✅ Optimistic updates
✅ Responsive design

---

## Deployment Considerations

1. **Environment Variables**: All validated with Zod
2. **Logging**: Winston with daily rotation
3. **Error Handling**: Production-safe error messages
4. **Security**: Production CORS whitelist
5. **Database**: Connection pooling configured
6. **Monitoring**: Comprehensive logging
7. **Scalability**: Stateless design

---

## Quick Code Examples

### Password Hashing
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### JWT Token Generation
```typescript
const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
const refreshToken = crypto.randomBytes(64).toString('hex');
```

### Rate Limiting
```typescript
authLimiter: 5 requests / 15 minutes
generalLimiter: 100 requests / 15 minutes
otpLimiter: 5 requests / hour
```

### Input Validation
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});
```

### Optimistic Update
```typescript
onMutate: async (newMessage) => {
  await queryClient.cancelQueries(['messages']);
  const previous = queryClient.getQueryData(['messages']);
  queryClient.setQueryData(['messages'], [...previous, newMessage]);
  return { previous };
}
```

---

**Remember**: This is a production-ready, secure, scalable chat application with comprehensive error handling, security measures, and performance optimizations.
