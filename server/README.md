# Backend for Secure Video Streaming Web App

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

- **POST /api/login**: Login with hardcoded credentials (username: admin, password: password).
- **GET /api/logout**: Logout and destroy the session.
- **GET /api/protected**: Example protected route that requires authentication.
- **GET /api/stream**: Stream video (requires authentication).

