# 🎨 Atlanta Hope Organisation — Frontend

> React 18 + Vite frontend application for the Atlanta Hope Organisation platform.

---

## 🔗 Live Application

🌐 **Deployed URL (Vercel):** [https://atlanta-hope-organisation.vercel.app/](https://atlanta-hope-organisation.vercel.app/)

---

## 🌟 Overview & Key Features

* **Interactive Hero Section**: Particle network animations (via `tsParticles`), smooth spotlight tracking, parallax effects, and animated impact counters (`IntersectionObserver`).
* **M-Pesa STK Push Donation Form**: Instant mobile payment trigger connected directly to the backend.
* **Project & Blog Showcase**: Dynamic cards with GSAP ScrollTrigger reveal animations.
* **User & Admin Dashboard**: Authenticated views for tracking donations, managing projects, and approving admin requests.
* **Responsive & Accessible**: Mobile-first design, dark glassmorphic UI, global `prefers-reduced-motion` compliance.

---

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs the local dev server on `http://localhost:5173` and proxies `/api/*` requests to `http://localhost:5000` (configured in `vite.config.js`).

### Production Build
```bash
npm run build      # Generates production assets in /dist
npm run preview    # Previews the production build locally
```

---

## 🔑 Environment Variables

When deploying to Vercel, set the following environment variable in your Vercel Project Settings:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://atlanta-hope-organisation-1.onrender.com/api` | Live URL of the deployed Flask backend API |

---

## 📡 Backend API Contract

| Route | Method | Body Payload | Description |
|---|---|---|---|
| `/api/payments/mpesa/stkpush` | POST | `{ phoneNumber, amount }` | Triggers M-Pesa STK Push payment prompt |
| `/api/projects` | GET | — | Fetches all community projects |
| `/api/donations` | GET | — | Fetches donation history for counters & dashboard |
| `/api/supporters` | GET | — | Fetches active community supporters |
| `/api/blogs` | GET | — | Fetches blog articles & news updates |
| `/api/calendar` | GET | — | Fetches community events |
| `/api/auth/login` | POST | `{ email, password }` | Authenticates user and returns JWT token |
| `/api/auth/register` | POST | `{ name, email, password, role }` | Registers new user account |

> Note: All API requests automatically attach `Authorization: Bearer <token>` when a user is authenticated (configured in [`src/api/client.js`](file:///home/xervi/development/code/project/Atlanta-hope/Frontend/src/api/client.js)).

---

## 📂 Project Structure

```text
src/
├── api/
│   └── client.js            – Axios instance, JWT interceptor, API endpoints
├── context/
│   └── AuthContext.jsx      – JWT authentication state & session persistence
├── hooks/                   – Custom hooks (useCounter, useMagneticButton, useIsMobile)
├── components/              – UI components (NavigationBar, HeroSection, DonationForm, ProjectCards, etc.)
└── pages/                  – Home, ProjectsPage, AboutPage, BlogPage, DonatePage, LoginPage, RegisterPage, Dashboard
```

---

## 🚀 Deployment (Vercel)

This frontend is configured for deployment on Vercel:
* `vercel.json` provides SPA fallback rewrites (`/* -> /index.html`) so route refreshes work seamlessly.
