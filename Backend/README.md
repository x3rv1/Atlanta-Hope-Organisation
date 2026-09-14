# ⚙️ Atlanta Hope Organisation — Backend

> Flask RESTful API backend service powering authentication, project management, blog posts, community calendar, and M-Pesa payment integration.

---

## 🔗 Live Service

⚙️ **Deployed API URL (Render):** [https://atlanta-hope-organisation-1.onrender.com/](https://atlanta-hope-organisation-1.onrender.com/)

---

## 🌟 Overview & Key Modules

* **Authentication & Authorization**: User registration, login, JWT token issuance, role-based permissions (User/Admin), and admin account approval workflows.
* **Project Management**: CRUD endpoints for tracking community development projects.
* **Blog & News Management**: Publish and view success stories, articles, and organizational updates.
* **Community Calendar**: Manage upcoming events, workshops, and volunteer activities.
* **Donations & Supporters**: Record donations and active supporter records for impact reporting.
* **M-Pesa Payment Gateway**: Integrated with Safaricom Daraja API for Lipa Na M-Pesa STK push processing and callback handling.

---

## 🛠️ Technology Stack

* **Language**: Python 3.10+
* **Framework**: Flask
* **ORM & Database**: Flask-SQLAlchemy, Flask-Migrate (SQLite in Dev / PostgreSQL in Prod)
* **Authentication**: Flask-JWT-Extended
* **CORS Management**: Flask-CORS
* **Production WSGI Server**: Gunicorn
* **Hosting Platform**: Render (via `render.yaml`)

---

## 🚀 Local Setup & Installation

### 1. Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables Configuration
Create a `.env` file in the `Backend` directory:
```env
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=sqlite:///atlanta_hope.db
SECRET_KEY=your-dev-secret-key
JWT_SECRET_KEY=your-dev-jwt-secret-key
PORT=5000

# Safaricom Daraja M-Pesa Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_lipa_na_mpesa_passkey
MPESA_CALLBACK_URL=https://atlanta-hope-organisation-1.onrender.com/api/payments/callback
```

### 3. Initialize & Seed Database
```bash
python seed.py
```
*Seeds default admin (`admin@atlantahope.org` / `admin123`) and sample projects, blogs, supporters, and calendar events.*

### 4. Run Development Server
```bash
python run.py
```
*Runs backend locally on `http://localhost:5000`.*

---

## 📡 API Endpoints Reference

### Auth Routes (`/api/auth`)
* `POST /api/auth/register` — Register a new account
* `POST /api/auth/login` — Login & receive JWT access token
* `GET /api/auth/me` — Fetch current user profile
* `GET /api/auth/admin/requests` — View pending admin registration requests *(Admin only)*
* `POST /api/auth/admin/requests/<user_id>/approve` — Approve admin access *(Admin only)*
* `POST /api/auth/admin/requests/<user_id>/reject` — Reject admin access *(Admin only)*

### Projects Routes (`/api/projects`)
* `GET /api/projects` — List all projects
* `GET /api/projects/<id>` — Fetch project details
* `POST /api/projects` — Create project *(Admin only)*
* `PUT /api/projects/<id>` — Update project *(Admin only)*
* `DELETE /api/projects/<id>` — Delete project *(Admin only)*

### Payment & M-Pesa Routes (`/api/payments`)
* `POST /api/payments/mpesa/stkpush` — Initiate M-Pesa STK Push payment prompt
* `POST /api/payments/callback` — Daraja API payment callback handler

### Blog Routes (`/api/blogs`)
* `GET /api/blogs` — List all blogs
* `GET /api/blogs/<id>` — Fetch blog details
* `POST /api/blogs` — Create blog post *(Admin only)*
* `PUT /api/blogs/<id>` — Update blog post *(Admin only)*
* `DELETE /api/blogs/<id>` — Delete blog post *(Admin only)*

### Calendar Routes (`/api/calendar`)
* `GET /api/calendar` — List community events
* `POST /api/calendar` — Create calendar event *(Admin only)*
* `PUT /api/calendar/<id>` — Update event *(Admin only)*
* `DELETE /api/calendar/<id>` — Delete event *(Admin only)*

### Donations & Supporters (`/api/donations`, `/api/supporters`)
* `GET /api/donations` — Fetch all donations
* `GET /api/supporters` — Fetch active supporters list

---

## ☁️ Deployment (Render)

Deployment is automated via [`render.yaml`](file:///home/xervi/development/code/project/Atlanta-hope/Backend/render.yaml):
* **Build Command**: `pip install -r requirements.txt && python seed.py`
* **Start Command**: `gunicorn run:app`
