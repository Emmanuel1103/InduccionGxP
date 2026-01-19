# InduccionGxP Backend

Minimal Node/Express backend for development.

Quick start:

```bash
cd backend
npm install
npm run dev   # requires nodemon, or `npm start` to run once
```

The frontend (Vite) is configured to proxy `/api` to `http://localhost:3000` during development.

Example request:

GET http://localhost:5173/api/hello -> proxied to backend -> returns JSON
