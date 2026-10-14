# ShopKart — MERN E-Commerce Full-Stack Application

ShopKart is a modern, full-stack e-commerce web application featuring user authentication, product catalog browsing, wishlist management, cart operations, Razorpay payment gateway integration, and order history tracking.

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

### 4. Razorpay Payment Gateway & Checkout
- **Server-Side Price Calculation**: Order amounts and stock checks are calculated securely on the server, preventing client-side tampering.
- **Razorpay Checkout SDK**: Integration with Razorpay standard checkout popup supporting Cards, UPI, Net Banking, and Wallets.
- **HMAC SHA-256 Signature Verification**: Server validates payment integrity via cryptographic signature verification (`order_id|payment_id` against key secret) before marking orders as paid.
- **Fallback Payment Simulator**: Built-in test simulator mode allowing testing of checkout, success callbacks, and order fulfillment without requiring external credentials.

### 5. Order Management & Receipts
- **Real-Time Order Tracking**: Displays order status (`CONFIRMED`, `PENDING_PAYMENT`, etc.), itemized receipts, and shipping information.
- **Order History**: Authenticated users can review past purchases with detailed order IDs and Razorpay transaction IDs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Tooling**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **State Management & Network**: React Context API, [Axios](https://axios-http.com/) (with `withCredentials: true`)
- **Payments**: Razorpay Checkout SDK (`checkout.js`)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)

### Backend
- **Runtime & Server**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) / Mongoose
- **Payments**: Razorpay Node SDK (`razorpay`), Node `crypto` for HMAC SHA-256 verification
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

3. **Razorpay Checkout & Verification Lifecycle**:
   - **Order Creation (`POST /orders/create-payment-order`)**: The client submits the shipping address and cart items. The server verifies stock, recalculates the exact total from the database, creates a pending `Order` record, and requests an order ID from the Razorpay API.
   - **Checkout Execution**: The frontend dynamically loads the Razorpay checkout script and opens the Razorpay payment modal with the backend-issued order details.
   - **Signature Verification (`POST /orders/verify-payment`)**: After payment completion, Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The backend validates the signature using `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)`:
     ```js
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
       .digest('hex');
     ```
   - **Order Confirmation**: Once the cryptographic signature matches, the backend transitions the order to `CONFIRMED` and `paymentStatus: 'PAID'`, clears the user's cart, and decrements stock.

4. **Data Persistence**:
   - Products, carts, wishlists, and orders are persisted in MongoDB collections with relationships mapped to authenticated customer IDs.

---

## 🏃 Quick Start Guide

### 1. Configure Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```

### 2. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```

### 3. Start the Frontend Dev Server (Port 5173)
```bash
cd ..
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.
