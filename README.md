# Goutham Acharya Portfolio — Full-Stack (Vercel)

A modern full-stack React + Tailwind CSS portfolio featuring an integrated AI Chatbot powered by **Grok / xAI API** and Vercel Serverless Functions.

---

## Architecture

```text
                      USER
                        │
                        ▼
               ┌─────────────────┐
               │     VERCEL      │
               │                 │
               │   React + Vite  │
               │     Frontend    │
               │        +        │
               │   Serverless    │
               │   API (/api/*)  │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   GROK / xAI    │
               │      API        │
               └─────────────────┘
```

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend / Serverless**: Vercel Serverless Functions (`/api/*`), Node.js, Zod, Nodemailer
- **AI Engine**: Grok / xAI API (`https://api.x.ai/v1`) using `XAI_API_KEY` (with fallback `GROQ_API_KEY`)
- **Hosting**: Unified full-stack deployment on **Vercel** (zero third-party backend servers required)

---

## Vercel Serverless API Endpoints

- `POST /api/chat` — Streaming AI chatbot completions (xAI Grok / Groq)
- `GET /api/chat/status` — Live AI model health check & status
- `GET /api/portfolio` — Dynamic portfolio JSON with ETag caching
- `GET /api/portfolio/config` — Public configuration details
- `GET /api/portfolio/resume` — Resume PDF stream
- `POST /api/contact` — Secure contact form with Zod validation & Nodemailer
- `GET /api/social/whatsapp` — Redirect to WhatsApp
- `GET /api/social/call` — Redirect to phone call
- `GET /api/social/github` — Redirect to GitHub profile
- `GET /api/health` — API health check

---

## Environment Variables (Vercel Dashboard)

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Description | Required | Environment |
| :--- | :--- | :--- | :--- |
| `XAI_API_KEY` | Grok / xAI API Key from [console.x.ai](https://console.x.ai/) | **Yes (for Grok AI)** | Production, Preview, Development |
| `GROQ_API_KEY` | Alternative / Fallback AI Key from [console.groq.com](https://console.groq.com/) | Optional fallback | Production, Preview, Development |
| `SMTP_HOST` | SMTP Server (e.g. `smtp.gmail.com`) | Optional | Production, Preview |
| `SMTP_PORT` | SMTP Port (`465` or `587`) | Optional | Production, Preview |
| `SMTP_USER` | SMTP Username / Email | Optional | Production, Preview |
| `SMTP_PASS` | Gmail App Password | Optional | Production, Preview |
| `RECIPIENT_EMAIL` | Destination email for contact messages | Optional | Production, Preview |

> **Security Note**: All secret keys (`XAI_API_KEY`, `GROQ_API_KEY`, `SMTP_PASS`) are accessed **only** on the server side in serverless functions and are **never exposed to the browser**.

---

## Local Development

```bash
# 1. Install root & frontend dependencies
npm install

# 2. Start frontend dev server
npm run dev:frontend

# 3. Build for production
npm run build
```

---

## Deployment to Vercel

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```
