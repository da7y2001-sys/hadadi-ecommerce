# Hadadi E-Commerce — Full-Stack Platform

A modern, production-structured Full-Stack E-Commerce web application built with **React 19**, **Vite**, **Express 5**, and **MongoDB Atlas**. The platform delivers a complete end-to-end e-commerce flow: customer registration and authentication, optimized catalog browsing and real-time search, discount-aware sorting and filtering, localStorage cart and wishlist synchronization, transactional checkout with stock reservation, customer and admin order management with atomic inventory restoration, and a community product reviews and ratings system featuring verified buyer badges.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Security Considerations](#security-considerations)
- [REST API Reference](#rest-api-reference)
- [Project Structure](#project-structure)
- [Installation & Local Setup](#installation--local-setup)
- [Environment Variables](#environment-variables)
- [MongoDB Atlas & Replica Set Requirements](#mongodb-atlas--replica-set-requirements)
- [Available Scripts](#available-scripts)
- [Verification & Automated Testing](#verification--automated-testing)
- [Production Readiness & Limitations](#production-readiness--limitations)

---

## Overview & Architecture

The application adopts a decoupled client-server architecture with strict separation of concerns, secure token handling, and database-level consistency guarantees:

```
┌─────────────────────────────────────────────────────────────────┐
│                        React 19 Client                          │
│  - React Router 7 (SPA navigation & protected route guards)     │
│  - Context API (AuthContext, CartContext)                       │
│  - Centralized Axios Interceptor (auto Bearer token injection)  │
│  - UI: Framer Motion, Swiper, React Hot Toast, React Icons      │
└────────────────┬────────────────────────────────▲───────────────┘
                 │ HTTP / REST                    │ JSON Responses
                 │ (CORS with credentials)        │ Error Contracts
┌────────────────▼────────────────────────────────┴───────────────┐
│                        Express 5 Backend                        │
│  - Middleware: Helmet, CORS, Rate Limiting, JSON Body Parser    │
│  - Security: JWT Authentication & Role-Based Authorization      │
│  - Controllers: Admin, Auth, Order, Product, Profile, Review   │
│  - Atomic Transactions: Mongoose ClientSession (2-phase commit) │
└────────────────┬────────────────────────────────────────────────┘
                 │ Mongoose ODM / Driver (Replica Set / Atlas)
┌────────────────▼────────────────────────────────────────────────┐
│                        MongoDB Database                         │
│  - Collections: users, products, orders, reviews                │
│  - Compound unique indexes & ACID multi-document transactions   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets:
1. **Centralized Communication Layer:** All outbound HTTP requests flow through a single Axios instance (`src/services/api.js`). Request interceptors automatically inject the `Authorization: Bearer <token>` header from `localStorage`, and response interceptors normalize server error messages.
2. **Server-Authoritative Business Logic:** Prices, discounts, stock availability, and verified buyer states are never trusted from the client. Checkout calculates totals and discounts directly from MongoDB documents inside a database transaction.
3. **Transactional Inventory Integrity:** Both checkout (stock reservation) and order cancellation (inventory restoration) execute inside MongoDB multi-document transactions (`session.startTransaction()`) with atomic increment/decrement operations and condition guards (`$gte`).

---

## Tech Stack

### Frontend
- **React 19** (`^19.2.8`) — UI framework using modern hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`).
- **Vite** (`^8.3.0`) — Ultra-fast build tool and local development server with HMR.
- **React Router DOM** (`^7.18.4`) — Client-side declarative routing, nested layouts, and route guards.
- **Axios** (`^1.20.0`) — Promise-based HTTP client with centralized interceptors.
- **React Hot Toast** (`^2.6.1`) — Non-blocking, accessible toast notifications.
- **Swiper** (`^14.3.0`) — Touch-enabled carousel for hero banners and related product sliders.
- **Framer Motion** (`^14.3.0`) — Smooth component entry and layout transitions.
- **React Icons** (`^5.7.0`) — Accessible iconography.

### Backend & Database
- **Node.js** (v18+ / v20+ / v22+) — Asynchronous runtime environment.
- **Express 5** (`^5.3.0`) — RESTful routing engine with native async error handling.
- **MongoDB & Mongoose** (`^9.11.2`) — Document database with schema validation and multi-document transactions.
- **JSON Web Token (`jsonwebtoken`)** (`^9.0.3`) — Stateless authentication tokens with expiration claims.
- **bcryptjs** (`^3.0.3`) — Salted password hashing (cost factor 10).
- **Helmet** (`^8.3.0`) — HTTP security response headers.
- **express-rate-limit** (`^8.7.1`) — Endpoint rate limiting against brute-force attacks.
- **CORS** (`^2.8.6`) — Cross-Origin Resource Sharing control with configurable origin whitelist.

---

## Core Features

### 1. Authentication & Role-Based Authorization
- **Registration & Login:** Clean registration with email normalization, password hashing, and duplicate checks. Login issues signed JWT tokens containing `userId` and `role`.
- **Role Enforcement:** Strict authorization gates for customers (`role: "user"`) and administrators (`role: "admin"`).
- **Client Route Guards:** `ProtectedRoute` redirects unauthenticated users to `/login`; `AdminRoute` restricts administrative pages to admin users.

### 2. Product Catalog & Performance Optimization
- **Dedicated Category Extraction (`GET /products/categories`):** Uses MongoDB `distinct` over active products, eliminating the need to load the full catalog just to populate navigation menus.
- **Search Suggestions (`GET /products/suggest?q=...`):** Lightweight autocomplete endpoint returning top 5 matches with projected fields (`_id`, `name`, `image`) without loading full product models.
- **Catalog Filtering & Discount-Aware Sorting:** Category page filters products by category, stock availability, and effective selling price:
  $$\text{effectivePrice} = \text{discount} > 0 \; ? \; \text{price} \times \left(1 - \frac{\text{discount}}{100}\right) : \text{price}$$
  Price filters (Min / Max) and sorting (Low $\to$ High, High $\to$ Low) respect the effective selling price.

### 3. Shopping Cart & Wishlist
- **Persistent Local State:** Synchronized with `localStorage` for offline persistence across page reloads.
- **Real-time Synchronization:** Dynamic item badge counters in the navigation header.
- **Stock Guards:** Prevents adding more items than currently in stock and disables out-of-stock items.

### 4. Checkout & Atomic Order Processing
- **Server-Side Price Recalculation:** Client-supplied prices are discarded. Backend checks stock in real time, applies discounts, computes item totals, and decrements stock.
- **MongoDB ACID Transactions:** Stock decrement and order creation occur within a single transaction session. If any product is out of stock, the entire checkout aborts cleanly with zero data corruption.

### 5. Customer & Admin Order Management
- **Customer Order Cancellation (`PATCH /orders/:id/cancel`):** Customers can cancel their own orders while status is `Processing`. Cancellation is forbidden for `Shipped`, `Delivered`, or `Cancelled` orders.
- **Atomic Inventory Restoration:** Restores product stock and decrements `soldCount` using atomic `$inc` operators with strict condition checks (`soldCount: { $gte: item.quantity }`).
- **Admin Order Workflow:** Admins can view all platform orders and transition statuses (`Processing` $\to$ `Shipped` $\to$ `Delivered` $\to$ `Cancelled`). Admin cancellation triggers the exact same safe inventory restoration logic.

### 6. Product Reviews & Ratings System
- **Single Review Enforcement:** Compound unique index `{ user: 1, product: 1 }` prevents multiple reviews per user on the same product, returning `409 Conflict`.
- **Verified Buyer Detection:** System queries order history for non-cancelled orders containing the product. Non-buyers are welcome to review, but verified customers receive a green `✔ Verified Buyer` badge.
- **Dynamic Rating Statistics:** Recomputes `ratingAverage` (rounded to 1 decimal place) and `ratingCount` on `Product` whenever a review is created, edited, or deleted. Reset safely to `0` if all reviews are removed.
- **Review Permissions:** Authors can update or delete their reviews. Platform administrators can delete any review.

### 7. Admin Dashboard & Product CRUD
- **Product Management:** Full create, read, update (including name, price, stock, SKU, discount, description, category, brand, image, and `isActive` toggle), and delete capabilities.
- **Customer & Order Oversight:** Tabular view of platform orders and registered user accounts.
- **Navigation Integration:** Top header displays an "Admin Panel" link exclusively for authenticated administrators.

---

## Security Considerations

- **Password Hashing:** Passwords hashed with bcrypt (salt rounds = 10) before storage; plaintext passwords are never logged or stored.
- **Token Sanitation:** User password hashes are excluded from responses (`select("-password")`).
- **HTTP Header Hardening:** `helmet()` sets standard protective headers (XSS filter, frameguard, noSniff, hidePoweredBy).
- **Rate Limiting:** `express-rate-limit` prevents abusive request floods.
- **Input Validation & Sanitization:** Strict schema validations on both client and server (e.g., ratings must be integers 1–5; comments 3–1000 characters; email trimmed and lowercased).
- **Route Injection Prevention:** All MongoDB ObjectId parameters are verified with `mongoose.Types.ObjectId.isValid()`.
- **CORS Protection:** Configurable via `FRONTEND_URL` environment variable; credentials supported securely.

---

## REST API Reference

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API health and status check |
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Authenticate credentials and obtain JWT |
| `GET` | `/products` | List all active products |
| `GET` | `/products/categories` | Get distinct active product categories |
| `GET` | `/products/suggest?q=...` | Get top 5 search suggestions (`_id`, `name`, `image`) |
| `GET` | `/products/search?q=...` | Search products by name, category, or brand |
| `GET` | `/products/best-selling` | Retrieve top best-selling products |
| `GET` | `/products/:id` | Get single active product details |
| `GET` | `/products/:productId/reviews` | List all reviews for a product (newest first) |

### Authenticated Endpoints (Customer & Admin)

*Requires header: `Authorization: Bearer <token>`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile` | Get current authenticated user profile |
| `PATCH` | `/profile` | Update user name or email |
| `PATCH` | `/profile/password` | Change user password |
| `POST` | `/orders` | Create an order with transactional stock decrement |
| `GET` | `/orders` | Get order history for the authenticated user |
| `PATCH` | `/orders/:id/cancel` | Cancel customer's own order (only if `Processing`) |
| `GET` | `/products/:productId/reviews/my-review` | Get authenticated user's review for a product |
| `POST` | `/products/:productId/reviews` | Post a product review (verifies buyer status) |
| `PATCH` | `/reviews/:id` | Update own product review |
| `DELETE` | `/reviews/:id` | Delete own review (or any review if Admin) |

### Admin Endpoints

*Requires header: `Authorization: Bearer <token>` with `user.role === "admin"`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/products` | List all products (including inactive items) |
| `POST` | `/products` | Create a new product document |
| `PATCH` | `/products/:id` | Update complete product fields |
| `DELETE` | `/products/:id` | Delete product from database |
| `GET` | `/admin/orders` | List all customer orders |
| `PATCH` | `/admin/orders/:id/status` | Update order status (`Processing`, `Shipped`, `Delivered`, `Cancelled`) |
| `GET` | `/admin/users` | List registered user accounts |

---

## Project Structure

```text
myapp/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js     # Admin orders, status updates, user queries
│   │   ├── orderController.js     # Checkout transaction, orders, cancel & stock restore
│   │   ├── productController.js   # Product CRUD, categories, suggestions, search
│   │   ├── profileController.js   # User profile & password updates
│   │   └── reviewController.js    # Review CRUD, rating stats helper, verified buyer
│   ├── middleware/
│   │   ├── adminMiddleware.js     # Admin role verification
│   │   └── authMiddleware.js      # JWT token authentication
│   ├── models/
│   │   ├── Order.js               # Order schema & items subdocument
│   │   ├── Product.js             # Product schema, rating stats, inventory tracking
│   │   ├── Review.js              # Review schema with compound unique index
│   │   └── User.js                # User schema with credentials and roles
│   ├── routes/
│   │   ├── adminRoutes.js         # /admin routing
│   │   ├── auth.js                # /auth registration & login
│   │   ├── orderRoutes.js         # /orders customer routing
│   │   ├── productRoutes.js       # /products catalog & product reviews routing
│   │   ├── profileRoutes.js       # /profile user routing
│   │   └── reviewRoutes.js        # /reviews review management routing
│   ├── .env.example               # Backend environment variable template
│   ├── db.js                      # MongoDB connection setup
│   ├── package.json               # Backend dependencies and scripts
│   └── server.js                  # Express app configuration & middleware
├── public/                        # Static assets
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── AdminRoute/            # Admin route protection guard
│   │   ├── ErrorBoundary/         # React runtime error boundary
│   │   ├── ErrorState/            # Friendly error & retry display
│   │   ├── Footer/                # Site footer
│   │   ├── Header/                # Header, TopHeader, SearchBox, category nav
│   │   ├── HeroSlider/            # Promotional banner carousel
│   │   ├── ProductCard/           # Product card with price, badge, rating
│   │   ├── ProductList/           # Product grid and category sliders
│   │   └── ProtectedRoute/        # Authentication route protection guard
│   ├── context/
│   │   ├── AuthContext.jsx        # User state, login, logout, token persistence
│   │   └── CartContext.jsx        # Cart & wishlist state synchronized with localStorage
│   ├── pages/
│   │   ├── Admin/                 # Admin dashboard, products, orders, users
│   │   ├── CartPage.jsx           # Cart view & item quantity modification
│   │   ├── CategoryPage.jsx       # Category browsing with discount-aware sort/filter
│   │   ├── CheckoutPage.jsx       # Shipping form & transactional order placement
│   │   ├── OrdersPage.jsx         # Customer order history & order cancellation
│   │   ├── ProductDetails.jsx     # Detail view, rating summary, reviews & form
│   │   ├── Profile.jsx            # Account info & password change
│   │   ├── SearchPage.jsx         # Full catalog search results
│   │   ├── WishlistPage.jsx       # Saved favorites
│   │   └── Login.jsx / Register.jsx
│   ├── services/
│   │   └── api.js                 # Central Axios instance with auth interceptor
│   ├── utils/
│   │   └── formatPrice.js         # Currency and price formatting utility
│   ├── App.jsx                    # Root routing & category initialization
│   └── main.jsx                   # React DOM entrypoint
├── .env.example                   # Frontend environment variable template
├── eslint.config.js               # ESLint configuration
├── package.json                   # Frontend dependencies and scripts
└── vite.config.js                 # Vite build configuration
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or later)
- **npm** (v9.0.0 or later)
- A running **MongoDB** instance (MongoDB Atlas recommended, see requirements below)

### Step 1: Clone Repository
```bash
git clone https://github.com/da7y2001-sys/hadadi-ecommerce.git
cd hadadi-ecommerce/myapp
```

### Step 2: Configure Environment Variables
Copy the example environment files for both frontend and backend:

```bash
# Frontend
cp .env.example .env

# Backend
cd backend
cp .env.example .env
cd ..
```

*(On Windows PowerShell, use `Copy-Item .env.example .env`)*

### Step 3: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 4: Run the Application

#### Start the Backend API (Port 5000)
```bash
cd backend
npm run dev
```

#### Start the Frontend Client (Port 5173)
In a separate terminal:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Based on `backend/.env.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string (Replica Set / Atlas required) | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecommerce` |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `your_super_secret_jwt_key_here` |
| `PORT` | Port on which the Express server listens | `5000` |
| `FRONTEND_URL`| Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend Configuration (`.env`)
Based on `.env.example`:

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000` |

---

## MongoDB Atlas & Replica Set Requirements

> [!IMPORTANT]
> **Multi-Document ACID Transactions:**
> The order creation workflow (`POST /orders`) and order cancellation workflow (`PATCH /orders/:id/cancel`) use Mongoose `ClientSession` (`session.startTransaction()`) to guarantee atomic stock changes and prevent inventory race conditions.
>
> MongoDB transactions **require a Replica Set**. They will not function on a standalone MongoDB instance.
>
> - **MongoDB Atlas:** All MongoDB Atlas clusters (including the free M0 tier) are replica sets by default and fully support transactions out of the box.
> - **Local MongoDB:** If running locally via Docker or native binary, you must initiate a single-node replica set (`rs.initiate()`) before testing checkout or cancellation.

---

## Available Scripts

### Frontend Scripts (from `myapp/`)
- `npm run dev` — Launches Vite dev server with hot module replacement at `localhost:5173`.
- `npm run build` — Compiles and optimizes assets into production-ready static files in `dist/`.
- `npm run preview` — Locally previews the built production bundle.
- `npm run lint` — Runs ESLint across all JavaScript/JSX source files.

### Backend Scripts (from `myapp/backend/`)
- `npm run dev` — Runs the Express API server with `nodemon` for automatic reload on file changes.
- `npm start` — Runs the server with production Node.js.

---

## Verification & Automated Testing

The codebase has undergone verification across all layers:

1. **Static Analysis & Compilation:**
   - ESLint: **0 errors, 0 warnings** across the entire workspace.
   - Vite Production Build: Completed cleanly without warnings.
   - Node.js Syntax Verification: All backend routes and controllers validated with `node --check`.

2. **Integration Test Suite:**
   The backend includes comprehensive integration tests verifying:
   - Order cancellation restrictions (forbidding cancellation of shipped/delivered orders).
   - Atomic inventory rollback upon cancellation (`stock` increments, `soldCount` decrements).
   - Category distinct extraction and search suggestions.
   - Compound unique index duplicate review rejection (`409 Conflict`).
   - Verified buyer badge calculation against order history.
   - Dynamic product rating statistic recalculation (and clean reset to 0 upon deletion).

---

## Production Readiness & Limitations

This project is a high-quality portfolio application demonstrating realistic full-stack e-commerce architecture. For transparency, the following features are intentionally out of scope for this version:

- **Payment Gateway Integration:** Checkout creates simulated orders directly without third-party payment gateways (e.g., Stripe, PayPal).
- **Email Delivery:** Account registration and password updates do not dispatch verification emails or transactional receipts.
- **File Upload Storage:** Product images are referenced via external image URLs rather than an S3/Cloudinary media bucket.
- **Cart Storage Location:** The shopping cart and wishlist are persisted in browser `localStorage` rather than server-synced database records.
- **Admin Promotion:** New registrations default to `role: "user"`. First-time admin promotion is performed directly in the database (`db.users.updateOne({ email: "..." }, { $set: { role: "admin" } })`).
