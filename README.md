# Hadai E-Commerce

A full-stack e-commerce application built as a learning and portfolio project. It includes a React storefront, JWT authentication, a localStorage cart and wishlist, backend-managed checkout and stock, order history, and an admin area for products, orders, and users.

## Overview

This project demonstrates a complete MVP flow: browse and search products, add items to a cart or wishlist, create an account, check out, and review orders. Administrators can manage products and update order statuses from a protected dashboard.

The application is intentionally built with a straightforward React + Express + MongoDB stack rather than a larger framework. It is suitable as a portfolio project, but it is not a production-ready commerce platform.

## Features

- User registration and login
- JWT authentication and protected routes
- Role-based admin authorization
- User profile editing
- Password change
- Product browsing by category
- Product search
- Product details
- Cart stored in localStorage
- Wishlist stored in localStorage
- Checkout with backend price and stock calculation
- Stock decrement during checkout
- Stock restoration when an order is cancelled
- Order history for the signed-in user
- Admin dashboard
- Admin product create, update, and delete
- Admin order listing and status updates
- Admin user listing
- Responsive UI
- Loading and error states for the main data flows
- Toast notifications for user actions

## Technologies

### Frontend

- React
- Vite
- React Router
- Axios
- Context API
- CSS
- React Hot Toast
- Swiper

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Helmet
- express-rate-limit

## Project Structure

The Git repository root is this directory.

```text
myapp/
├── backend/
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env.example
│   ├── db.js
│   └── server.js
├── public/
├── src/
│   ├── components/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/
│   │   └── Admin/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

- `backend/server.js` contains the product, profile, order, and admin API routes.
- `backend/routes/auth.js` contains registration and login.
- `src/services/api.js` is the shared Axios client.
- `src/context/` contains authentication and cart/wishlist state.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/da7y2001-sys/hadadi-ecommerce.git
cd hadadi-ecommerce
```

### 2. Install frontend dependencies

Run this from the repository root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Create the backend environment file

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Never commit `.env`. It is ignored by Git.

### 5. Configure MongoDB

Use either a local MongoDB instance or a MongoDB Atlas cluster.

For Atlas:

1. Create a cluster and database user.
2. Allow your IP address in Atlas network access.
3. Copy the SRV connection string into `MONGO_URI`.

The application creates collections automatically through Mongoose when data is first saved. Products can then be added through the admin dashboard.

### 6. Start the backend

From `backend/`:

```bash
npm run dev
```

For a production-style run:

```bash
npm start
```

The API runs on `http://localhost:5000` by default.

### 7. Start the frontend

Open a second terminal at the repository root:

```bash
npm run dev
```

Vite will print the local frontend URL, usually `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

Use placeholders only in documentation and examples:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

- `MONGO_URI` — MongoDB connection string.
- `JWT_SECRET` — secret used to sign JWTs. Use a long random value in any real deployment.
- `PORT` — backend port. Defaults to `5000`.
- `FRONTEND_URL` — allowed frontend origin for CORS. Multiple origins can be comma-separated.

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` changes the backend URL used by Axios. The frontend has a localhost fallback for development, but setting the variable explicitly is recommended.

Frontend environment variables are public. Never put secrets in them.

## Admin Setup

New registrations are always created with the `user` role.

For this MVP, promote a user manually in MongoDB after registering:

```js
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin" } }
)
```

The role is included in the JWT when the user logs in. After changing a role in the database, the user must log out and log in again for the new role to take effect.

Once an admin account exists, create the first products from `/admin/products`. Product images are supplied as image URLs.

## API Overview

### Public

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | API health response |
| GET | `/products` | List products |
| GET | `/products/search?q=term` | Search products by name, brand, or category |
| GET | `/products/:id` | Get a single product |
| POST | `/auth/register` | Create a user account |
| POST | `/auth/login` | Log in and receive a JWT |

### Authenticated User

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/profile` | Get the current user |
| PATCH | `/profile` | Update name and email |
| PATCH | `/profile/password` | Change password |
| POST | `/orders` | Create an order and decrement stock |
| GET | `/orders` | Get only the current user's orders |

### Admin

Admin endpoints require a valid JWT for a user whose role is `admin`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/products` | Create a product |
| PATCH | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |
| GET | `/admin/orders` | List all orders |
| PATCH | `/admin/orders/:id/status` | Update an order status |
| GET | `/admin/users` | List users without password hashes |

Authentication failures return `401`. Authenticated users without the required admin role receive `403`.

Order statuses are `Processing`, `Shipped`, `Delivered`, and `Cancelled`. Cancelling an order restores its quantities exactly once. A cancelled order cannot be moved back to an active status.

## Development

### Frontend commands

Run these from the repository root:

```bash
npm run dev      # start Vite development server
npm run build    # create a production build in dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

### Backend commands

Run these from `backend/`:

```bash
npm run dev      # start with nodemon
npm start        # start with node
```

## Important Limitations

This is an MVP and portfolio project, not a production e-commerce platform.

- Payment processing is not implemented. Checkout creates an order without charging anyone.
- Reviews and ratings are not implemented. The UI does not display product ratings.
- Email verification and password reset are not implemented.
- Product image upload is not implemented. Products use image URLs.
- The cart and wishlist are stored in the browser, not in the backend.
- There is no automated test suite yet.
- Admin creation is a manual MongoDB step.
- Production deployment, backups, monitoring, and a hardened secret-management process are outside the scope of this version.

The project is intended to show working full-stack fundamentals honestly rather than pretend to be a finished commercial product.
