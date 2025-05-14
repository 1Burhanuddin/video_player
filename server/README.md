# Backend for Secure Video Streaming Web App

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
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

## Notes

- The video path is set to `../videos/sample.mp4`. Replace it with your actual video path.
- Session secret is set to 'your-secret-key'. Change it in production. 