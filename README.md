# ShopKart — MERN E-Commerce Full-Stack Application

ShopKart is a modern, full-stack e-commerce web application featuring user authentication, product catalog browsing, wishlist management, cart operations, checkout, and order history tracking.

---

## 🌐 Live Deployment Links

- **Live Frontend (Vercel)**: [https://shop-kart-ecru.vercel.app/](https://shop-kart-ecru.vercel.app/)
- **Live Backend API (Render)**: [https://shopkart-backend-y3uc.onrender.com/](https://shopkart-backend-y3uc.onrender.com/)
- **Health Check Endpoint**: [https://shopkart-backend-y3uc.onrender.com/health](https://shopkart-backend-y3uc.onrender.com/health)
- **GitHub Repository**: [https://github.com/AryanMoorthy/ShopKart](https://github.com/AryanMoorthy/ShopKart)

---

## 🚀 Key Features

### 1. Authentication & Security
- **User Registration & Login**: Client-side validation for form inputs, password strength, and formatting with server-side validation.
- **JWT & Secure Cookie Handling**: Token-based authentication using `HttpOnly` cookies to protect against XSS attacks.
- **Protected Routes**: React Router route guards checking user session status before rendering protected pages.
- **Account Management**: Ability for authenticated users to view profile details and update passwords securely.

### 2. Product Catalog & Discovery
- **Browsing & Filtering**: Explore products with categorization, search, and sorting.
- **Product Details**: Comprehensive view with descriptions, stock status, ratings, and price breakdowns.

### 3. Cart & Wishlist Operations
- **Interactive Cart**: Add, remove, and adjust item quantities with live total price calculations.
- **Wishlist**: Save favorite items to purchase later, synchronized with user accounts.

### 4. Checkout & Order Management
- **Seamless Checkout**: Address collection and payment method selection.
- **Order Tracking & History**: View previous orders, status badges, and itemized receipts.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Tooling**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **State Management & Network**: React Context API, [Axios](https://axios-http.com/) (with `withCredentials: true`)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) / Mongoose
- **Security & Utilities**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`

---

## ⚙️ How It Works

1. **Client Request & Authentication Flow**:
   - The user registers or logs in via the React frontend.
   - The Express backend validates credentials, hashes passwords with `bcryptjs`, and issues a signed JWT.
   - The JWT is stored in an `HttpOnly`, `SameSite` secure cookie transmitted automatically via Axios.

2. **Session Verification & State Management**:
   - Upon page load or route transitions, the frontend queries `/customers/me` to verify active sessions.
   - Global states (User profile, Cart, and Wishlist) are managed via React Context providers (`AuthContext`, `CartContext`, `WishlistContext`).

3. **Data Persistence & API Endpoints**:
   - Products, carts, wishlists, and orders are persisted in MongoDB collections.
   - Protected API routes pass through authentication middleware (`auth.middleware.js`) which verifies the JWT before executing business logic.

---

## 🏃 Quick Start Guide

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend Dev Server (Port 5173)
```bash
cd ..
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
