# 🌟 Atlanta Hope Organisation (AHO)

> A modern, full-stack non-profit web platform empowering community transformation, transparent project tracking, blog updates, community events, and seamless M-Pesa mobile donations.

---

## 🔗 Live Deployments

* 🌐 **Frontend Web Application (Vercel):** [https://atlanta-hope-organisation.vercel.app/](https://atlanta-hope-organisation.vercel.app/)
* ⚙️ **Backend API Service (Render):** [https://atlanta-hope-organisation-1.onrender.com/](https://atlanta-hope-organisation-1.onrender.com/)

---

## 📖 About the Project

**Atlanta Hope Organisation** is a full-stack digital platform designed to connect donors, community members, and volunteers with impactful social projects. The application features a rich, modern user interface built with React and Vite, supported by a scalable Python Flask RESTful API.

### Key Features
* 🚀 **Interactive Hero & Live Impact Counters**: Dynamic counters showcasing completed projects, lives impacted, and active supporters.
* 📁 **Project Showcase**: Detailed view of ongoing and completed community projects with real-time updates.
* ✍️ **News & Impact Stories Blog**: Engaging blog section highlighting success stories, community updates, and news.
* 📅 **Event Calendar**: Community event tracking and scheduling.
* 🔐 **Secure Role-Based Authentication**: JWT authentication with user registration, login, and admin approval workflows.
* 💳 **M-Pesa Mobile Money Integration**: Direct STK push integration using Safaricom Daraja API for fast and secure donations.
* 🎨 **Premium Modern Design**: Royal purple, emerald, and gold palette featuring micro-animations, glassmorphism, tsParticles, and smooth GSAP reveals.

---

## 🏗️ Repository Architecture

```text
Atlanta-hope/
├── Frontend/                 # React (Vite) Single Page Application
│   ├── src/
│   │   ├── api/              # Axios client & API endpoints
│   │   ├── components/       # UI components (Hero, Navigation, DonationForm, etc.)
│   │   ├── context/          # Auth Context & JWT state management
│   │   └── pages/            # Home, Projects, Blog, Donate, Dashboard, etc.
│   ├── vercel.json           # Vercel SPA rewrite configuration
│   └── vite.config.js        # Vite dev server & API proxy config
│
└── Backend/                  # Flask RESTful API & Database
    ├── app/
    │   ├── models/           # SQLAlchemy Data Models (User, Project, Blog, etc.)
    │   ├── routes/           # API Blueprints (Auth, Projects, Payments, etc.)
    │   └── config.py         # Application configuration
    ├── seed.py               # Database initialization & seeding script
    ├── run.py                # Flask entry point
    └── render.yaml           # Render deployment blueprint
```

---

## 🛠️ Technology Stack

### Frontend
* **Framework**: React 18 + Vite
* **Styling & Motion**: Vanilla CSS3, Framer Motion, GSAP ScrollTrigger, tsParticles
* **State & HTTP**: React Context API, Axios
* **Icons**: React Icons (`react-icons/fi`)

### Backend
* **Language & Framework**: Python 3.10+, Flask
* **ORM & Database**: Flask-SQLAlchemy, SQLite (Dev) / PostgreSQL (Prod)
* **Authentication**: Flask-JWT-Extended
* **Server & Deployment**: Gunicorn, Render
* **Payment Processing**: Safaricom Daraja M-Pesa API

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py            # Initialize and seed database
python run.py             # Starts Flask backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev               # Starts Vite dev server on http://localhost:5173
```

---

## 🌐 Deployment Configuration

* **Frontend**: Deployed on **Vercel** with client-side SPA routing (`vercel.json`) and `VITE_API_BASE_URL` pointing to the live Render backend.
* **Backend**: Deployed on **Render** via `render.yaml` infrastructure-as-code blueprint running `gunicorn run:app`.

---

## 📝 License

This project is open-source and built for the Atlanta Hope Organisation.
