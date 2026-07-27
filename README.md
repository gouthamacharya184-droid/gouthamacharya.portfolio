# Goutham Acharya Portfolio

A cinematic React + Tailwind + Framer Motion portfolio with an Express + Nodemailer backend for secure contact submissions.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Nodemailer, Zod, Helmet
- Deploy-ready for Vercel/Netlify frontend plus Render/Railway/VPS backend

## Features

- Cinematic hero and section animations
- Resume-driven content structure
- Responsive layout with mobile navigation
- Dark/light theme toggle
- Project cards, skill bars, timeline sections
- Secure contact form with backend validation
- Email delivery to Gmail with confirmation email to sender
- WhatsApp redirect handled by backend to avoid exposing the number in frontend source
- CV download support

## Project Structure

```text
goutham-portfolio/
├── frontend/
├── backend/
└── README.md
```

## Local Setup

### 1) Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2) Configure environment variables

The `.env` files are already included for local development with safe defaults.
SMTP (email) is **optional** — all features except the contact form work without it.

To enable email sending, open `backend/.env` and fill in:
```env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password   # Gmail App Password (not your login password)
RECIPIENT_EMAIL=your-gmail@gmail.com
```

### 3) Start the servers

#### 🪟 Windows (Easiest — double-click or run from Explorer)

```
start-backend.bat    ← starts the backend
start-frontend.bat   ← starts the frontend
start-all.bat        ← starts both in separate windows
```

#### 🪟 Windows PowerShell (if npm is blocked by execution policy)

PowerShell may block `npm.ps1` with a security error. Use `cmd /c` prefix instead:

```powershell
# Backend
cmd /c "cd backend && npm install && npm run dev"

# Frontend (open a second terminal)
cmd /c "cd frontend && npm install && npm run dev"
```

#### 🐧 macOS / Linux / CMD

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (open a second terminal)
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:8787`.
The Vite proxy automatically forwards all `/api/*` requests to the backend — no extra configuration needed.


## Deploy Notes

### Frontend

Set:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

Deploy `frontend/` to Vercel or Netlify.

### Backend

Deploy `backend/` to Render, Railway, Fly.io, or a Node server.

Set these environment variables on the backend host:

```env
PORT=8787
FRONTEND_URL=https://your-frontend-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
RECIPIENT_EMAIL=your-gmail@gmail.com
WHATSAPP_NUMBER=911234567890
GITHUB_URL=https://github.com/gouthamacharya184-droid
```

## Security Notes

- Email credentials, owner email, and WhatsApp number are stored only in backend environment variables.
- The frontend uses a backend route for WhatsApp redirect.
- The contact route validates input and applies rate limiting.
- Public GitHub URLs remain public by design.

## Important Limitation

No web app can completely hide the existence of the backend route it calls. This build keeps secrets off the frontend and out of the DOM, which is the realistic security boundary for browser-based applications.

## Resume / Assets

- Profile image: included in `frontend/public/profile.png`
- Resume download: included in `frontend/public/resume.pdf`

## Optional Improvements

- Add real project screenshots and live demo links
- Add backend logging or captcha
- Add unit and integration tests
- Add analytics and SEO enhancements
