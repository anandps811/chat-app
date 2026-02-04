# Production Deployment Guide

This guide covers deploying the frontend application to production.

## Pre-Deployment Checklist

- [ ] Set up environment variables (see `ENV_SETUP.md`)
- [ ] Update API and Socket URLs to production endpoints
- [ ] Test the build locally: `npm run build`
- [ ] Verify all routes work correctly
- [ ] Test authentication flow
- [ ] Test real-time messaging

## Building for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in the `dist` directory
```

## Environment Variables

Before building, ensure you have set the correct environment variables:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

**Important**: Environment variables are embedded at build time. You must rebuild after changing them.

## Deployment Platforms

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the client directory
3. Add environment variables in Vercel dashboard
4. Deploy: `vercel --prod`

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Routing

The application uses React Router for client-side routing. All routes are handled on the client side:

- `/` - Welcome screen (redirects to `/chats` if authenticated)
- `/login` - Login page
- `/signup` - Sign up page
- `/otp` - OTP verification
- `/profile-setup` - Profile setup (protected)
- `/chats` - Chat list (protected)
- `/chats/new` - New message screen (protected)
- `/chats/:chatId` - Chat detail (protected)

### Server Configuration

For single-page applications, configure your server to serve `index.html` for all routes:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Performance Optimizations

The build includes:
- Code splitting (React, React Query, Socket.IO in separate chunks)
- Minification
- Tree shaking
- Source maps (development only)

## Error Handling

The application includes an Error Boundary component that catches React errors and displays a user-friendly error page.

## Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Performance monitoring (Web Vitals)

## Security

- Never commit `.env` files
- Use HTTPS in production
- Ensure CORS is properly configured on the backend
- Validate all user inputs
- Use secure cookie settings for authentication tokens

## Troubleshooting

### Routes not working
- Ensure your server is configured to serve `index.html` for all routes
- Check that the base path is correct in your deployment

### API connection errors
- Verify environment variables are set correctly
- Check CORS settings on the backend
- Ensure the API URL is accessible from the client

### Socket connection issues
- Verify `VITE_SOCKET_URL` is set correctly
- Check that WebSocket connections are allowed
- Ensure the socket server is running and accessible
