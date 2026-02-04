# Environment Variables Setup

This document explains how to configure environment variables for the frontend application.

## Development Setup

1. Create a `.env` file in the `client` directory (copy from `.env.example` if it exists):
   ```bash
   cp .env.example .env
   ```

2. Configure the following variables:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3001/api

   # Socket.IO Configuration
   VITE_SOCKET_URL=http://localhost:3001
   ```

## Production Setup

For production, set these environment variables in your hosting platform:

```env
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Socket.IO Configuration
VITE_SOCKET_URL=https://api.yourdomain.com
```

## Important Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend code
- Environment variables are embedded at build time, not runtime
- After changing environment variables, you must rebuild the application
- Never commit `.env` files with sensitive data to version control

## Platform-Specific Instructions

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with the `VITE_` prefix
4. Redeploy your application

### Netlify
1. Go to Site settings > Build & deploy > Environment
2. Add each variable with the `VITE_` prefix
3. Redeploy your application

### Docker
```dockerfile
ENV VITE_API_BASE_URL=https://api.yourdomain.com/api
ENV VITE_SOCKET_URL=https://api.yourdomain.com
```

## Verification

After setting up environment variables, verify they're loaded correctly:
- Check the browser console for any API connection errors
- Verify the network tab shows requests going to the correct API URL
