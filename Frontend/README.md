# Atlanta Hope Organisation — Frontend

A React (Vite) frontend built to the brief: royal purple / emerald / gold / charcoal
palette, Playfair Display + Montserrat type, Framer Motion + GSAP motion, a
particle-network hero, and M-Pesa donations wired to your backend.

## One substitution worth knowing

The brief named **Particles.js**, which has no maintained React bindings. This
build uses **tsParticles** instead — it's the actively maintained successor,
built by the same author, with the identical "particles + links + cursor
interactivity" behavior the brief describes. If you specifically need the
legacy library, swap `src/components/HeroSection.jsx`'s particle block for a
`react-particles-js` wrapper; everything else is unaffected.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api/*` requests
to `http://localhost:8000` (see `vite.config.js` — change the target to match
your backend).

```bash
npm run build      # production build to /dist
npm run preview    # preview the production build locally
```

## Backend contract expected by this frontend

| Route | Method | Body | Used by |
|---|---|---|---|
| `/api/payments/mpesa/stkpush` | POST | `{ phoneNumber, amount }` | `DonationForm` — displays `response.message` on success, or `response.data.message` from a rejected request on failure |
| `/api/projects` | GET | — | Live "Projects Completed" counter, `ProjectCards` |
| `/api/donations` | GET | — | Live "Lives Impacted" counter, `Dashboard` donation history |
| `/api/supporters` | GET | — | Live "Active Supporters" counter, `SupporterCards` |
| `/api/auth/login` | POST | `{ email, password }` → `{ token, user }` | `Login`, `AuthContext` |
| `/api/auth/register` | POST | `{ name, email, password }` → `{ token, user }` | `Register`, `AuthContext` |

Every request automatically carries `Authorization: Bearer <token>` once a
user has logged in (see `src/api/client.js`). A `401` response clears the
stored token.

**Every list-fetching component (hero counters, projects, supporters) falls
back to seeded placeholder data if the backend is unreachable**, so the site
never looks broken during development — swap in your real backend and it
takes over automatically.

## Project structure

```
src/
  api/client.js          – axios instance, JWT interceptor, all endpoint calls
  context/AuthContext.jsx – JWT auth state (login/register/logout)
  hooks/                  – useCounter, useMagneticButton, useIsMobile
  components/
    NavigationBar         – sticky, shrinks on scroll, mobile menu
    HeroSection            – parallax, particle network, spotlight, magnetic CTAs, slider
    DonationForm            – M-Pesa STK push form
    ProjectCards             – GSAP ScrollTrigger reveal + hover
    SupporterCards            – staggered testimonial grid
    Footer, ProtectedRoute
  pages/                     – Home, ProjectsPage, About, Blog, Donate, Login,
                                Register, Dashboard (protected)
```

## Performance & mobile notes

- Particle network and cursor-tracking effects (spotlight, magnetic buttons)
  are **disabled below 768px** and replaced with the same entry animations
  used elsewhere — per the brief's mobile fallback requirement.
- `prefers-reduced-motion` is respected globally (`index.css`) and specifically
  in the magnetic-button hook.
- Fonts are loaded via `<link rel="preconnect">` in `index.html` to keep hero
  text painting fast.
- Counters only animate once, triggered by `IntersectionObserver`, so they
  don't re-fire on every scroll.

## Environment

No `.env` is required for the frontend itself — all backend communication
goes through the relative `/api` path, so the same build works in any
environment as long as your reverse proxy / hosting config forwards `/api`
to your backend.
