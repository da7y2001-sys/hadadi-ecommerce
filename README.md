# Hadadi Tech — Full-Stack E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Demo-hadadi--ecommerce.vercel.app-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://hadadi-ecommerce.vercel.app)
[![Browse Accessories](https://img.shields.io/badge/Browse-Accessories-FF69B4?style=for-the-badge&logo=shopify&logoColor=white)](https://hadadi-ecommerce.vercel.app/category/accessories)
[![API Status](https://img.shields.io/badge/API-hadadi--tech--api.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://hadadi-tech-api.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/da7y2001-sys/hadadi-ecommerce)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

A modern, production-structured Full-Stack E-Commerce web application built with **React 19**, **Vite**, **Node.js Express 5**, and **MongoDB Atlas**. Hadadi Tech delivers a comprehensive end-to-end shopping experience featuring bilingual localization (Arabic RTL & English LTR), Saudi Riyal currency formatting, discount-aware catalog filtering, real-time search suggestions, persistent cart and wishlist states, transactional checkout with atomic stock reservations, verified-buyer product reviews, and an administrative dashboard equipped with polling-based admin order notifications.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Features](#2-features)
- [3. Technology Stack](#3-technology-stack)
- [4. Project Structure](#4-project-structure)
- [5. Installation and Setup](#5-installation-and-setup)
- [6. Environment Variables](#6-environment-variables)
- [7. API Overview](#7-api-overview)
- [8. Authentication and Authorization](#8-authentication-and-authorization)
- [9. Database & Transactional Order Processing](#9-database--transactional-order-processing)
- [10. Deployment Architecture](#10-deployment-architecture)
- [11. Future Improvements](#11-future-improvements)

---

## 1. Project Overview

Hadadi Tech is an e-commerce platform designed for consumer electronics and modern tech gear. The project models real-world e-commerce architecture with a strict separation of concerns:
- **Client-Side:** Responsive, accessible Single Page Application (SPA) with full RTL/LTR bi-directional layout support and instant language toggling.
- **Server-Side:** RESTful API with route-level security, rate limiting, and server-authoritative calculations that discard untrusted client prices.
- **Database:** MongoDB Atlas replica set leveraging multi-document ACID transactions for zero-loss stock reservation and cancellation rollbacks.

### Quick Links
- **Live Storefront:** [https://hadadi-ecommerce.vercel.app](https://hadadi-ecommerce.vercel.app)
- **Browse Accessories:** [https://hadadi-ecommerce.vercel.app/category/accessories](https://hadadi-ecommerce.vercel.app/category/accessories)
- **Live Backend API:** [https://hadadi-tech-api.onrender.com](https://hadadi-tech-api.onrender.com)
- **Source Code Repository:** [https://github.com/da7y2001-sys/hadadi-ecommerce](https://github.com/da7y2001-sys/hadadi-ecommerce)

---

## 2. Features

### Storefront & Shopping Experience
- **Catalog Browsing & Categorization:** Filter products across 7 unified tech categories (*Phones, Audio, Laptops, Watches, Monitors, Gaming, Accessories*).
- **Dedicated Category Extraction (`GET /products/categories`):** Employs MongoDB `distinct` aggregation to populate navigation bars dynamically without loading full product models.
- **Real-Time Autocomplete (`GET /products/suggest?q=...`):** Lightweight autocomplete search returning top 5 matches with projected fields (`_id`, `name`, `image`) and debounced input handling.
- **Discount-Aware Sorting & Filtering:** Real-time client and server filtering respecting the computed selling price:
  $$\text{effectivePrice} = \text{discount} > 0 \; ? \; \text{price} \times \left(1 - \frac{\text{discount}}{100}\right) : \text{price}$$
- **Interactive Product Details:** High-resolution product showcase with image gallery selection, stock badges, discount calculations, dynamic rating summaries, related products slider, and verified buyer reviews.
- **Persistent Cart & Wishlist:** Client-side state managed via Context API and automatically synchronized with `localStorage` across browser tabs. Out-of-stock guards prevent adding quantities beyond current inventory.
- **Saudi Riyal Currency Representation:** Localized currency presentation via a reusable `<RiyalSymbol />` component displaying `ر.س` in Arabic and `SAR` in English.

### Bilingual Localization (Arabic & English)
- **Dynamic RTL / LTR Switching:** Toggles `document.documentElement.dir` (`rtl` vs `ltr`) and `lang` (`ar` vs `en`) on the fly.
- **CSS Logical Properties:** Stylesheets utilize CSS logical properties (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`) to maintain layout symmetry without CSS duplication.
- **Bi-Directional Text Isolation:** Sensitive text fields like Order IDs, phone numbers, email addresses, and prices are wrapped with `<bdi>` and `dir="ltr"` to prevent punctuation inversion in Arabic.

### User Account & Profile Management
- **Customer Authentication:** JWT-based authentication with salted bcrypt password hashing (cost factor 10).
- **Profile Dashboard:** View and update account credentials (full name, email) and securely change passwords with current-password verification.
- **Order History:** Detailed order status tracking (`Processing`, `Shipped`, `Delivered`, `Cancelled`) with individual order cancellation support.

### Community Product Reviews & Ratings
- **Single Review Constraint:** Compound unique database index `{ user: 1, product: 1 }` prevents multiple reviews per user on the same product (`409 Conflict`).
- **Verified Buyer Badge:** Automatically checks customer order history. If the customer purchased the item in a non-cancelled order, their review displays a green `✔ Verified Buyer` badge.
- **Dynamic Rating Recalculation:** Server automatically updates `ratingAverage` (rounded to 1 decimal place) and `ratingCount` on the `Product` document whenever a review is created, edited, or deleted.
- **Author & Admin Permissions:** Customers can edit or delete their own reviews. Administrators have moderation privileges to delete any review.

### Administrative Management Suite
- **Modern Analytics Dashboard:** Revenue metrics, active order distribution breakdown, and quick management links.
- **Product Management (CRUD):** Create new products, update specifications, adjust inventory stock, configure percentage discounts, and toggle catalog visibility (`isActive`).
- **Order Fulfillment Workflow:** Inspect platform orders, review customer shipping information, and manage status transitions (`Processing` $\to$ `Shipped` $\to$ `Delivered` $\to$ `Cancelled`).
- **User Oversight:** View all registered user accounts with registration timestamps (passwords excluded).
- **Polling-Based Admin Order Notifications:**
  - Background polling runs on an interval of **15 seconds** while an authenticated administrator is in the admin suite (`AdminNotificationContext.jsx`).
  - Notification bell in the admin navigation displays unread count badges and a dropdown list of recent orders.
  - Generates interactive toast notifications when new orders are placed.
  - Supports marking individual or all notifications as read (`PATCH /admin/notifications/:id/read`, `PATCH /admin/notifications/read-all`).

### Responsive Layout & Mobile Optimization
- **Unified 2-Column Mobile Grid:** Standardized across Category, Search, Best-Selling, and Wishlist pages at viewports $\le 768\text{px}$.
- **Adaptive Slider Navigation:** Desktop and laptop viewports display white elevated slider navigation arrows; mobile viewports ($\le 600\text{px}$) cleanly hide arrows to prioritize touch swipe gestures.
- **Mobile Admin Drawer:** Administrative sidebar transforms into a compact, responsive top navigation bar on mobile screens without horizontal overflow.
- **Table Scroll Containers:** User and order tables are wrapped in horizontal scroll containers with `overflow-wrap: anywhere` on alphanumeric IDs.

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Component architecture, state hooks, and Context providers |
| **Vite** | `^8.3.0` | Build tool, development server, and client bundler |
| **React Router DOM** | `^7.18.4` | Client-side declarative routing, nested routes, and route guards |
| **Axios** | `^1.20.0` | Promise-based HTTP client with centralized auth interceptors |
| **Swiper** | `^14.3.0` | Touch-enabled carousel for hero banners and product sliders |
| **React Hot Toast** | `^2.6.1` | Non-blocking, accessible toast notifications |
| **Framer Motion** | `^14.3.0` | Page transition effects |
| **React Icons** | `^5.7.0` | Vector iconography |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=20.0.0` | Asynchronous JavaScript server runtime |
| **Express** | `^5.3.0` | Web application framework and RESTful routing engine |
| **Helmet** | `^8.3.0` | Security headers middleware (XSS, Sniff, Frameguard) |
| **express-rate-limit** | `^8.7.1` | Rate limiter protecting authentication endpoints |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing control with origin whitelist |
| **bcryptjs** | `^3.0.3` | Salted password hashing |
| **jsonwebtoken** | `^9.0.3` | Stateless signed JSON Web Tokens for authentication |
| **dotenv** | `^18.0.8` | Environment variable loader |

### Database & ODM
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Cloud M0+ | Managed cloud document database (Replica Set configuration) |
| **Mongoose** | `^9.11.2` | Object Data Modeling (ODM), schema validation, and transactions |

### Deployment & Hosting
| Platform | Component | Configuration |
| :--- | :--- | :--- |
| **Vercel** | Frontend Web App | Single-Page Application rewrites via `vercel.json` |
| **Render** | Backend Web Service | Node.js web service running `node server.js` |
| **MongoDB Atlas** | Database | Dedicated cloud cluster with network access controls |

---

## 4. Project Structure

The repository contains the root React application alongside the backend service directory:

```text
hadadi-ecommerce/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js         # Order status workflow, user lists, admin notifications
│   │   ├── orderController.js         # Transactional checkout, user orders, cancel & inventory restore
│   │   ├── productController.js       # Product CRUD, categories, search, suggestions, best-selling
│   │   ├── profileController.js       # Profile management and password updates
│   │   └── reviewController.js        # Review CRUD, rating recalculations, verified buyer lookup
│   ├── middleware/
│   │   ├── adminMiddleware.js         # Admin role authorization check (HTTP 403)
│   │   └── authMiddleware.js          # Bearer JWT token verification (HTTP 401)
│   ├── models/
│   │   ├── Notification.js            # Admin notification schema with unique orderId index
│   │   ├── Order.js                   # Customer order schema & item subdocuments
│   │   ├── Product.js                 # Product catalog schema, inventory, and rating stats
│   │   ├── Review.js                  # Review schema with compound unique user-product index
│   │   └── User.js                    # User account schema with hashed credentials & roles
│   ├── routes/
│   │   ├── adminRoutes.js             # /admin protected endpoints
│   │   ├── auth.js                    # /auth customer registration & login routes
│   │   ├── orderRoutes.js             # /orders customer checkout & cancellation routes
│   │   ├── productRoutes.js           # /products public & admin catalog routes
│   │   ├── profileRoutes.js           # /profile customer profile routes
│   │   └── reviewRoutes.js            # /reviews review moderation & update routes
│   ├── scripts/
│   │   └── seedProducts.js            # Database seeding script for catalog items
│   ├── .gitignore                     # Backend-specific ignore rules
│   ├── db.js                          # Mongoose connection initialization
│   ├── package.json                   # Backend dependencies, engines, and start scripts
│   └── server.js                      # Express app entrypoint, middleware, and route mounting
├── public/                            # Static public assets (icons, category images)
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminNotificationBell.jsx  # Notification bell, badge counter, and dropdown
│   │   ├── CategoryCatalog/           # Visual category navigation grid
│   │   ├── common/
│   │   │   ├── ProductImage.jsx       # Fallback-aware product image component
│   │   │   └── RiyalSymbol.jsx        # Localized Saudi Riyal (SAR / ر.س) currency glyph
│   │   ├── ErrorBoundary/             # React error boundary component
│   │   ├── ErrorState/                # Visual retry and error banner component
│   │   ├── Footer/                    # Bilingual site footer
│   │   ├── Header/                    # Header, SearchBox autocomplete, and top navigation
│   │   ├── HeroSlider/                # Promotional Swiper carousel
│   │   ├── ProductCard/               # Product card with discount badge, rating, and cart action
│   │   ├── ProductList/               # Category sliders and product grid displays
│   │   └── ProtectedRoute/            # Authentication & admin route protection wrappers
│   ├── context/
│   │   ├── AdminNotificationContext.jsx # 15s admin polling & toast provider
│   │   ├── AuthContext.jsx            # Authentication state, login, logout, and token persistence
│   │   ├── CartContext.jsx            # Shopping cart state synchronized with localStorage
│   │   ├── LanguageContext.jsx        # Bilingual (AR/EN) locale state and RTL/LTR direction
│   │   └── WishlistContext.jsx        # Customer wishlist synchronized with localStorage
│   ├── locales/
│   │   ├── ar.js                      # Complete Arabic translation dictionary
│   │   └── en.js                      # Complete English translation dictionary
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx     # Metrics, revenue card, and status breakdown
│   │   │   ├── AdminLayout.jsx        # Admin responsive layout and top navigation bar
│   │   │   ├── AdminOrders.jsx        # Order fulfillment table and status transitions
│   │   │   ├── AdminPage.jsx          # Admin product CRUD management
│   │   │   ├── AdminSidebar.jsx       # Responsive admin sidebar & mobile drawer
│   │   │   └── AdminUsers.jsx         # Registered user management table
│   │   ├── BestSellingPage.jsx        # Best-selling products catalog route
│   │   ├── CartPage.jsx               # Shopping cart item management
│   │   ├── CategoryPage.jsx           # Category-specific catalog browsing
│   │   ├── CheckoutPage.jsx           # Shipping form and order placement
│   │   ├── Home.jsx                   # Home page with hero banner and category sliders
│   │   ├── Login.jsx                  # Customer login form
│   │   ├── OrdersPage.jsx             # Customer order history and order cancellation
│   │   ├── ProductDetails.jsx         # Product view, review list, and submission form
│   │   ├── Profile.jsx                # Account profile and password update forms
│   │   ├── Register.jsx               # Customer registration form
│   │   ├── SearchPage.jsx             # Catalog search results
│   │   └── WishlistPage.jsx           # Saved items page
│   ├── services/
│   │   └── api.js                     # Centralized Axios instance with auth interceptor
│   ├── App.jsx                        # Application routes, error boundaries, and category prefetch
│   ├── main.jsx                       # React DOM entrypoint
│   └── index.css                      # Global styles and logical properties
├── .gitignore                         # Root git ignore rules
├── eslint.config.js                   # ESLint configuration
├── package.json                       # Frontend dependencies, engines, and build scripts
├── vercel.json                        # Vercel SPA rewrite configuration
└── vite.config.js                     # Vite build configuration
```

---

## 5. Installation and Setup

### Prerequisites
- **Node.js** (`>=20.0.0`)
- **npm** (`>=10.0.0`)
- A running **MongoDB** instance (MongoDB Atlas cluster recommended for transaction support)

### Step 1: Clone the Repository
```bash
git clone https://github.com/da7y2001-sys/hadadi-ecommerce.git
cd hadadi-ecommerce
```

### Step 2: Install Frontend Dependencies
From the repository root (`hadadi-ecommerce`):
```bash
npm install
```

### Step 3: Install Backend Dependencies
From the `backend/` directory:
```bash
cd backend
npm install
cd ..
```

### Step 4: Configure Environment Variables
Create `.env` in the repository root and `backend/.env` in the `backend/` folder following the specifications in [Section 6](#6-environment-variables).

### Step 5: (Optional) Seed the Database
To populate the catalog with initial tech products:
```bash
cd backend
node scripts/seedProducts.js
cd ..
```

### Step 6: Run the Applications Locally

#### Start the Backend API Server (Port 5000)
In your first terminal from `backend/`:
```bash
cd backend
npm run dev
```
*(Uses `nodemon server.js` for automatic restart on file changes).*

#### Start the Frontend Client (Port 5173)
In a second terminal from the repository root:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Environment Variables

### Backend Environment Configuration (`backend/.env`)
Create a file at `backend/.env`:

```env
# Server Port
PORT=5000

# Environment Mode
NODE_ENV=development

# MongoDB Connection String (Must support Replica Sets / Atlas)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Signing Secret (High-entropy random string)
JWT_SECRET=your_jwt_secret_key_here

# Allowed Frontend Origins for CORS (Comma-separated for multiple origins)
FRONTEND_URL=http://localhost:5173,http://localhost:4173
```

### Frontend Environment Configuration (`.env`)
Create a file at the root `.env`:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000
```

> [!WARNING]
> Frontend environment variables prefixed with `VITE_` are publicly accessible and baked into static bundles at build time. Never place database strings, API secrets, or private keys in the frontend `.env`.

---

## 7. API Overview

All backend routes are registered in [`backend/server.js`](backend/server.js).

### Public Endpoints
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API operational health check |
| `POST` | `/auth/register` | Register a new user account |
| `POST` | `/auth/login` | Authenticate user and return signed JWT (Rate limited) |
| `GET` | `/products` | List all active catalog products |
| `GET` | `/products/categories` | Retrieve distinct active product categories |
| `GET` | `/products/suggest?q=...` | Top 5 lightweight search suggestions |
| `GET` | `/products/search?q=...` | Search products across name, brand, and category |
| `GET` | `/products/best-selling` | Retrieve top best-selling products sorted by `soldCount` |
| `GET` | `/products/:id` | Retrieve single product details |
| `GET` | `/products/:productId/reviews` | Retrieve all reviews for a specific product |

### Authenticated Customer Endpoints
*Requires header: `Authorization: Bearer <token>`*

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/profile` | Retrieve authenticated user profile (password excluded) |
| `PATCH` | `/profile` | Update account full name and email address |
| `PATCH` | `/profile/password` | Update account password with verification |
| `POST` | `/orders` | Place an order with transactional stock reservation |
| `GET` | `/orders` | Retrieve authenticated user's order history |
| `PATCH` | `/orders/:id/cancel` | Cancel order if in `Processing` status & restore stock |
| `GET` | `/products/:productId/reviews/my-review` | Get authenticated user's review for a product |
| `POST` | `/products/:productId/reviews` | Create review (computes verified buyer status) |
| `PATCH` | `/reviews/:id` | Update customer's own review |
| `DELETE` | `/reviews/:id` | Delete customer's own review |

### Admin Endpoints
*Requires header: `Authorization: Bearer <token>` with `user.role === "admin"`*

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/admin/products` | List all products (including inactive items) |
| `POST` | `/products` | Create a new product document |
| `PATCH` | `/products/:id` | Update product fields and inventory stock |
| `DELETE` | `/products/:id` | Delete product from database |
| `GET` | `/admin/orders` | Retrieve all customer orders across the platform |
| `PATCH` | `/admin/orders/:id/status` | Update order status (`Processing`, `Shipped`, `Delivered`, `Cancelled`) |
| `GET` | `/admin/users` | List all registered user accounts (passwords excluded) |
| `GET` | `/admin/notifications` | Retrieve order notifications and unread count |
| `PATCH` | `/admin/notifications/:id/read` | Mark single notification as read |
| `PATCH` | `/admin/notifications/read-all` | Mark all unread notifications as read |
| `DELETE` | `/reviews/:id` | Moderate and delete any product review |

---

## 8. Authentication and Authorization

### Password Security & Hashing
- User passwords are automatically salted and hashed using `bcryptjs` with **10 salt rounds** during registration and password change.
- Plaintext passwords are never stored in the database or logged.
- Controllers explicitly use `.select("-password")` across profile queries and admin user listings to prevent password hash leakage.

### Token-Based Authentication
- Upon successful login, the server issues a signed JSON Web Token (`jsonwebtoken`) with a **7-day lifespan** (`{ expiresIn: "7d" }`).
- The token payload carries the user ID and role claims:
  ```json
  {
    "userId": "67290...",
    "role": "user"
  }
  ```
- The frontend stores the token in `localStorage` and automatically injects it as an `Authorization: Bearer <token>` header on all requests via an Axios request interceptor.
- If an API request returns an HTTP `401 Unauthorized` (e.g., token expired), the Axios response interceptor clears the token and dispatches an `auth:unauthorized` event to redirect to `/login`.

### Role-Based Access Control (RBAC)
- **`authMiddleware.js`:** Validates the Bearer token signature against `process.env.JWT_SECRET`. If valid, attaches `req.user = decoded` to the request pipeline.
- **`adminMiddleware.js`:** Verifies that `req.user.role === "admin"`. If false or missing, execution halts immediately with HTTP `403 Forbidden` (`Admin access required`).
- **Client Route Guards:**
  - `<ProtectedRoute>` prevents unauthenticated visitors from accessing `/profile`, `/orders`, and `/checkout`.
  - `<AdminRoute>` protects all `/admin/*` routes, redirecting non-admin users to `/` with an error message.

---

## 9. Database & Transactional Order Processing

### Mongoose Models & Schemas
- **`User`:** Stores `name`, `email` (unique index, lowercase, trimmed), hashed `password`, and `role` (`"user"` | `"admin"`).
- **`Product`:** Stores specifications (`name`, `price`, `discount`, `stock`, `soldCount`, `category`, `brand`, `sku`, `image`, `isActive`, `ratingAverage`, `ratingCount`). Enforces integer validation on stock and sold counters.
- **`Order`:** Stores `user` reference, subdocument items array (`product`, `name`, `image`, `quantity`, `price`), `total`, `status` (`Processing` | `Shipped` | `Delivered` | `Cancelled`), and `shippingAddress`.
- **`Review`:** Stores `user` and `product` references, `rating` (1–5), `comment`, and `isVerifiedPurchase`. Features a **compound unique index** `{ user: 1, product: 1 }` to guarantee one review per product per customer.
- **`Notification`:** Stores admin notification type, title, message, `orderId` (**unique index** to prevent duplicate notifications), `orderTotal`, `customerName`, and `isRead` (**indexed** for fast polling count).

### ACID Multi-Document Transactions
Order placement and order cancellation execute inside Mongoose `ClientSession` transactions (`session.startTransaction()`):

#### 1. Atomic Checkout (`POST /orders`)
- **Server Price Calculation:** Discards client prices. Calculates the exact unit selling price directly from MongoDB `Product` records.
- **Atomic Stock Reservation:**
  ```javascript
  const product = await Product.findOneAndUpdate(
    { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
    { $inc: { stock: -item.quantity, soldCount: item.quantity } },
    { new: true, session }
  );
  ```
- If any requested product lacks sufficient stock, the query returns `null`, the transaction calls `session.abortTransaction()`, and checkout returns an HTTP `409 Conflict` error without deducting stock for other items in the cart.
- Upon successful transaction commit, an admin notification document is generated asynchronously.

#### 2. Atomic Cancellation Inventory Rollback (`PATCH /orders/:id/cancel`)
- If an order is cancelled while in `Processing` status, `restoreOrderInventory()` runs within the transaction:
  ```javascript
  await Product.findOneAndUpdate(
    { _id: productId, soldCount: { $gte: item.quantity } },
    { $inc: { stock: item.quantity, soldCount: -item.quantity } },
    { new: true, session }
  );
  ```
- Guarantees inventory quantities are restored safely without race conditions.

---

## 10. Deployment Architecture

The application is deployed across three cloud platforms:

```
[ Client Browser ]
       │
       ├── HTTPS (Single Page App) ──► Vercel (Frontend Hosting)
       │                                │ Rewrites: vercel.json (/(.*) -> /)
       │                                │ Environment: VITE_API_URL
       │
       └── HTTPS (RESTful API) ──────► Render (Backend Web Service)
                                        │ Runs: node server.js
                                        │ Environment: MONGO_URI, JWT_SECRET, FRONTEND_URL
                                        │
                                        ▼
                                 MongoDB Atlas (Cloud Replica Set)
                                  Network Access: Configured deployment rules
```

### 1. Frontend on Vercel
- **Live URL:** [https://hadadi-ecommerce.vercel.app](https://hadadi-ecommerce.vercel.app)
- **Browse Accessories Category:** [https://hadadi-ecommerce.vercel.app/category/accessories](https://hadadi-ecommerce.vercel.app/category/accessories)
- **Framework Preset:** Vite
- **Root Directory:** `.` (repository root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **SPA Routing (`vercel.json`):** Configured with rewrite rules so direct URLs like `/category/phones`, `/category/accessories`, or `/admin/orders` route to `index.html` without triggering 404 errors:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/"
      }
    ]
  }
  ```
- **Environment Variable:** `VITE_API_URL=https://hadadi-tech-api.onrender.com`

### 2. Backend on Render
- **API URL:** [https://hadadi-tech-api.onrender.com](https://hadadi-tech-api.onrender.com)
- **Environment:** Node.js Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:**
  - `NODE_ENV=production`
  - `MONGO_URI=<mongodb_connection_string>`
  - `JWT_SECRET=<jwt_signing_key>`
  - `FRONTEND_URL=https://hadadi-ecommerce.vercel.app`

### 3. Database on MongoDB Atlas
- **Tier:** Cloud M0 Shared Cluster (Replica Set configuration).
- **Network Access & Security:** In production environments, network access should ideally be restricted to static IP addresses or dedicated egress CIDR ranges provided by the hosting platform (such as Render dedicated outbound IPs or private networking). Where shared dynamic hosting environments require broader network rules, database access must be tightly coupled with strong authentication credentials, least-privilege user roles, and database auditing. *(Note: This section documents security best practices; no changes to active database rules were made).*

---

## 11. Future Improvements

The following architectural and functional enhancements represent natural next steps for expanding the platform:

1. **Payment Gateway Integration:** Integrate modern payment providers (Stripe, HyperPay, Apple Pay) for real-world card processing and webhook-driven order fulfillment.
2. **Transactional Email Service:** Integrate an email service provider (SendGrid, Resend) to dispatch automated order confirmations, shipping updates, and password-reset links.
3. **Cloud Media Storage:** Transition product image storage from static paths to a cloud asset CDN (Cloudinary or AWS S3) with an administrative drag-and-drop image uploader.
4. **WebSocket Real-Time Notifications:** Upgrade admin order notifications from 15-second polling to full duplex WebSockets (`Socket.IO`) for instantaneous updates.
5. **Route-Level Code Splitting:** Implement `React.lazy()` and `<Suspense>` on administrative routes in `App.jsx` to reduce initial storefront bundle size below 500 kB.
