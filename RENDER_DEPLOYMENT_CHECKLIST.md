# Render Deployment Checklist

This document provides a comprehensive checklist for deploying the Chat App backend to Render.

## ✅ Pre-Deployment Code Verification

### 1. Port Configuration ✓
- [x] **PORT Environment Variable**: The server correctly uses `process.env.PORT` 
  - Location: `server/src/config/env.ts` (line 10)
  - Render automatically sets `PORT` to a random port (e.g., 10000)
  - The code will use Render's assigned port automatically
  - Default fallback to 3000 is only for local development

### 2. Server Binding ✓
- [x] **Server Listens on 0.0.0.0**: The server correctly binds to `0.0.0.0` to accept connections from Render's load balancer
  - Location: `server/src/index.ts` (line 94)
  - Code: `httpServer.listen(Number(PORT), '0.0.0.0', ...)`

### 3. CORS Configuration ✓
- [x] **ALLOWED_ORIGINS**: CORS is properly configured to use environment variable
  - Location: `server/src/index.ts` (lines 25-46)
  - In production, uses `ALLOWED_ORIGINS` from environment
  - Supports comma-separated list of origins
  - Socket.IO CORS also configured: `server/src/config/socket.ts` (lines 27-47)

### 4. NODE_ENV Configuration ✓
- [x] **NODE_ENV**: Environment variable schema supports 'production'
  - Location: `server/src/config/env.ts` (line 9)
  - Render should set `NODE_ENV=production` in dashboard

## 🔧 Render Dashboard Configuration

### Required Environment Variables

Set these in your Render service dashboard under **Environment**:

#### **Required Variables:**
```
NODE_ENV=production
PORT=<automatically set by Render, do not override>
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<your secure JWT secret (min 10 characters)>
```

#### **Required for CORS (Production):**
```
ALLOWED_ORIGINS=<your-frontend-url-1>,<your-frontend-url-2>
```
**Example:**
```
ALLOWED_ORIGINS=https://your-app.onrender.com,https://www.yourdomain.com
```
**Note:** Include ALL frontend URLs that will access the API (including www and non-www variants if applicable)

#### **Optional Variables (if using email/SMS):**
```
MJ_APIKEY_PUBLIC=<Mailjet public key>
MJ_APIKEY_PRIVATE=<Mailjet private key>
MJ_FROM_EMAIL=<sender email>
MJ_SENDER_EMAIL=<sender email>
MJ_FROM_NAME=<sender name>
TWILIO_ACCOUNT_SID=<Twilio account SID>
TWILIO_AUTH_TOKEN=<Twilio auth token>
TWILIO_PHONE_NUMBER=<Twilio phone number>
SEND_Email=true
LOG_LEVEL=info
```

#### **Optional MongoDB Configuration (defaults provided):**
```
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_CONNECT_TIMEOUT_MS=30000
MONGODB_SOCKET_TIMEOUT_MS=45000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=30000
MONGODB_HEARTBEAT_FREQUENCY_MS=10000
MONGODB_RETRY_WRITES=true
MONGODB_RETRY_READS=true
MONGODB_MAX_RECONNECT_ATTEMPTS=10
MONGODB_RECONNECT_INTERVAL_MS=5000
```

## 🗄️ MongoDB Atlas Configuration

### IP Whitelist (Critical!)
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access** → **IP Access List**
3. **Add IP Address**: `0.0.0.0/0` (allows access from anywhere)
   - **Important**: Render's outbound IPs are dynamic, so you must allow all IPs
   - **Security Note**: This is safe because MongoDB requires authentication
   - Your `MONGODB_URI` should include username/password authentication

### Database User
- Ensure your MongoDB user has appropriate permissions
- The connection string in `MONGODB_URI` should include credentials

## 🚀 Render Service Configuration

### Build & Start Commands

**Build Command:**
```bash
cd server && npm install && npm run build
```

**Start Command:**
```bash
cd server && npm start
```

**Alternative (if using root directory):**
```bash
npm install --prefix server && npm run build --prefix server && npm start --prefix server
```

### Service Settings
- **Environment**: Node
- **Node Version**: Check your `package.json` engines or use latest LTS
- **Root Directory**: `server` (if deploying from monorepo root) or leave blank if deploying from server directory
- **Auto-Deploy**: Enable if using Git integration

### Health Check
- **Health Check Path**: `/health`
- Render will automatically check this endpoint
- Current implementation: `server/src/index.ts` (line 70-72)

## 📋 Deployment Steps

1. **Prepare MongoDB Atlas**
   - [ ] Add `0.0.0.0/0` to IP whitelist
   - [ ] Verify database user credentials
   - [ ] Test connection string locally

2. **Set Environment Variables in Render**
   - [ ] Set `NODE_ENV=production`
   - [ ] Set `MONGODB_URI` (your Atlas connection string)
   - [ ] Set `JWT_SECRET` (generate a secure random string)
   - [ ] Set `ALLOWED_ORIGINS` (comma-separated frontend URLs)
   - [ ] Set optional variables if needed (email/SMS)

3. **Configure Build Settings**
   - [ ] Set build command: `cd server && npm install && npm run build`
   - [ ] Set start command: `cd server && npm start`
   - [ ] Verify root directory if needed

4. **Deploy**
   - [ ] Trigger deployment
   - [ ] Monitor build logs for errors
   - [ ] Check service logs after deployment

5. **Verify Deployment**
   - [ ] Test health endpoint: `https://your-service.onrender.com/health`
   - [ ] Test root endpoint: `https://your-service.onrender.com/`
   - [ ] Verify CORS is working from frontend
   - [ ] Test Socket.IO connection
   - [ ] Test authentication endpoints
   - [ ] Check application logs for any warnings/errors

## 🔍 Post-Deployment Verification

### Test Endpoints
```bash
# Health check
curl https://your-service.onrender.com/health

# Root endpoint
curl https://your-service.onrender.com/

# Should return: {"message":"Chat app Backend API is running!"}
```

### Common Issues & Solutions

#### Issue: "Cannot connect to MongoDB"
- **Solution**: Verify `0.0.0.0/0` is in MongoDB Atlas IP whitelist
- **Solution**: Check `MONGODB_URI` is correct and includes credentials

#### Issue: "CORS errors from frontend"
- **Solution**: Verify `ALLOWED_ORIGINS` includes your frontend URL (exact match required)
- **Solution**: Check for trailing slashes (include both with and without)
- **Solution**: For Socket.IO, ensure CORS origins match

#### Issue: "Port already in use" or "EADDRINUSE"
- **Solution**: This shouldn't happen - Render sets PORT automatically
- **Solution**: Verify you're not hardcoding a port anywhere

#### Issue: "Environment variable validation failed"
- **Solution**: Check all required variables are set in Render dashboard
- **Solution**: Verify `JWT_SECRET` is at least 10 characters
- **Solution**: Check `MONGODB_URI` is not empty

#### Issue: "Socket.IO connection fails"
- **Solution**: Verify `ALLOWED_ORIGINS` includes frontend URL
- **Solution**: Check Socket.IO CORS configuration matches Express CORS
- **Solution**: Ensure frontend uses correct WebSocket URL

## 📝 Environment Variable Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Render) | `10000` (auto) |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key-min-10-chars` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `https://app.example.com,https://www.example.com` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` (production) |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `SEND_Email` | Enable email sending | `false` |

## 🔐 Security Checklist

- [x] Server binds to `0.0.0.0` (required for Render)
- [x] CORS is restricted to `ALLOWED_ORIGINS` in production
- [x] Security headers are applied (`helmet` middleware)
- [x] Rate limiting is enabled
- [x] JWT secrets are stored in environment variables (not in code)
- [x] MongoDB requires authentication
- [ ] HTTPS is enforced (Render provides this automatically)
- [ ] Environment variables are not logged or exposed

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
- [Socket.IO Deployment Guide](https://socket.io/docs/v4/deployment/)

---

**Last Updated**: 2026-02-05
**Status**: ✅ Code is ready for Render deployment
