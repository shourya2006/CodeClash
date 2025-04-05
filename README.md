# Code Clash - 1v1 Coding Battles

A real-time competitive coding platform where users can compete in 1v1 coding battles using Codeforces problems.

## Deployment to Render.com

### Prerequisites
- A GitHub repository with your code
- A Render.com account

### Backend Deployment
1. Log in to Render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Name: `code-clash-server` (or your preferred name)
   - Root Directory: `server/`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `8080` (or let Render assign one automatically)
     - `CORS_ORIGIN`: Your frontend URL once deployed

### Frontend Deployment
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure:
   - Name: `code-clash` (or your preferred name)
   - Root Directory: `1v1/`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add Environment Variables:
     - `VITE_SERVER_URL`: Your backend service URL (from step 1)

### Important Configuration Changes Made
1. **Socket.io URLs**: Updated to use environment variables:
   ```javascript
   const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:8080', {
     // ... other options
   });
   ```

2. **Server CORS Configuration**: Updated to use environment variables:
   ```javascript
   const io = new Server(server, {
     cors: {
       origin: process.env.CORS_ORIGIN || "http://localhost:5173",
       // ... other options
     },
   });
   ```

3. **Port Configuration**: Updated to use environment variables:
   ```javascript
   const PORT = process.env.PORT || 8080;
   server.listen(PORT, () => {
     console.log(`SERVER RUNNING ON PORT ${PORT}...`);
   });
   ```

### After Deployment
1. Test the connection between frontend and backend
2. Verify that WebSocket connections are working correctly
3. Test all features (room creation, joining, problem fetching, etc.)

## Local Development
1. Clone the repository
2. Install dependencies:
   ```
   cd server && npm install
   cd ../1v1 && npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update values as needed
   
4. Run the backend:
   ```
   cd server && npm run dev
   ```
5. Run the frontend:
   ```
   cd 1v1 && npm run dev
   ```

## Environment Variables
- Server:
  - `.env` - Contains development configuration
  - `.env.example` - Example for production deployment
- Frontend:
  - `.env.development` - Used for local development
  - `.env.production` - Used for production deployment 