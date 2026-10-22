# Project Context

## What this project is

A full-stack e-commerce MVP built for learning and portfolio use.

- Frontend: React, Vite, React Router, Axios, Context API, CSS
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Repository root: `myapp/`
- Backend: `myapp/backend/`
- Frontend source: `myapp/src/`

## Current functionality

- User registration and login
- JWT authentication and protected routes
- Admin role authorization
- Profile editing and password change
- Product browsing, categories, search, and details
- localStorage cart and wishlist
- Checkout with backend price and stock calculation
- Stock decrement on order creation
- Stock restoration on order cancellation
- User order history
- Admin product management
- Admin order management
- Admin user listing
- Responsive UI, loading states, error states, and toast feedback

## Current state

The project is an MVP prepared for a GitHub/CV release. Core functionality is implemented. It is not a production commerce platform.

Known limitations:

- No payments
- No reviews or ratings
- No email verification or password reset
- No image uploads (products use image URLs)
- Cart and wishlist are browser-local
- First admin must be promoted manually in MongoDB
- No automated test suite yet

## Development

Frontend commands (from `myapp/`):

```bash
npm run dev
npm run build
npm run lint
```

Backend commands (from `myapp/backend/`):

```bash
npm run dev
npm start
```

Environment setup and API details are documented in `README.md`.
