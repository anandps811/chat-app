<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Chat App Frontend

A modern, production-ready chat application frontend built with React, TypeScript, and Vite.

## Features

- ✅ URL-based routing with React Router
- ✅ Protected routes for authenticated users
- ✅ Real-time messaging with Socket.IO
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error boundaries for production error handling
- ✅ Environment variable configuration
- ✅ Production build optimizations

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file in the client directory
   - See `ENV_SETUP.md` for configuration details
   - Example:
     ```env
     VITE_API_BASE_URL=http://localhost:3001/api
     VITE_SOCKET_URL=http://localhost:3001
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

See `PRODUCTION.md` for detailed deployment instructions.

## Project Structure

```
client/
├── components/          # Reusable components (ErrorBoundary, ProtectedRoute, etc.)
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom React hooks
├── screens/             # Screen components (pages)
├── services/           # API and Socket services
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main app component with routing
```

## Routing

The app uses React Router for client-side routing:

- `/` - Welcome screen
- `/login` - Login page
- `/signup` - Sign up page
- `/chats` - Chat list (protected)
- `/chats/new` - New message (protected)
- `/chats/:chatId` - Chat detail (protected)

## Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the frontend.

See `ENV_SETUP.md` for detailed configuration instructions.

## Documentation

- `ENV_SETUP.md` - Environment variable configuration
- `PRODUCTION.md` - Production deployment guide
