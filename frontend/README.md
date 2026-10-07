# MERN Authentication System

A secure and modern authentication system built with the **MERN stack**, featuring multiple login methods, OTP verification, JWT authentication, password reset, rate limiting, and session management.

## Features

- User registration with email and phone
- Email OTP verification
- Email + Password login
- Email + OTP login
- Phone + OTP login
- Forgot password & password reset
- Resend OTP with cooldown
- JWT access & refresh tokens
- Secure session management
- Account lockout after failed login attempts
- OTP attempt protection
- API rate limiting
- XSS protection
- MongoDB injection protection
- Helmet security headers
- Responsive React UI

> **Note:** Phone OTP is currently printed in the backend terminal instead of being sent through an SMS provider.

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer

**Security**
- Helmet
- Express Rate Limit
- XSS
- Validator
- MongoDB sanitization

## Project Structure

```text
MERN-Auth/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/verify-otp` | Verify registration OTP |
| POST | `/api/auth/set-password` | Set password |
| POST | `/api/auth/login-password` | Password login |
| POST | `/api/auth/login-otp` | Request email OTP login |
| POST | `/api/auth/verify-login-otp` | Verify email OTP |
| POST | `/api/auth/login-phone-otp` | Request phone OTP |
| POST | `/api/auth/verify-phone-login-otp` | Verify phone OTP |
| POST | `/api/auth/forgot-password` | Request reset OTP |
| POST | `/api/auth/verify-forgot-password-otp` | Verify reset OTP |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout & revoke session |

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd MERN-Auth
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## Deployment

Recommended deployment:

```text
React + Vite  →  Vercel
Node + Express → Render
MongoDB        → MongoDB Atlas
```

Make sure environment variables are configured in the deployment platforms and **never commit `.env` files or secrets to GitHub**.

## Author

**Harsh Singh**

Full-stack MERN developer focused on building secure, scalable and user-friendly web applications.
```
