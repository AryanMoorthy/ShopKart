import axios from 'axios';

// Create an Axios instance with base configuration
// withCredentials: true ensures HttpOnly cookies (containing JWT) are sent and received
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new customer
 * @param {Object} data - { fullName, email, password, phone }
 */
export const registerCustomerApi = async (data) => {
  const response = await api.post('/customers/register', data);
  return response.data;
};

/**
 * Login customer and receive HttpOnly cookie token
 * @param {Object} data - { email, password }
 */
export const loginCustomerApi = async (data) => {
  const response = await api.post('/customers/login', data);
  return response.data;
};

/**
 * Fetch authenticated customer profile using HttpOnly cookie token
 */
export const getProfileApi = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Logout customer and clear HttpOnly cookie
 */
export const logoutCustomerApi = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

/**
 * Change customer password
 * @param {Object} data - { oldPassword, newPassword }
 */
export const changePasswordApi = async (data) => {
  const response = await api.patch('/customers/change-password', data);
  return response.data;
};

/**
 * Fetch all products with optional query filters (search, category, sort)
 * @param {Object} params - { search, category, sort }
 */
export const getProductsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  if (params.category && params.category.trim() && params.category !== 'All' && params.category !== 'All Categories') {
    queryParams.append('category', params.category.trim());
  }
  if (params.sort && params.sort.trim()) {
    queryParams.append('sort', params.sort.trim());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/products?${queryString}` : '/products';
  const response = await api.get(url);
  return response.data;
};

/**
 * Fetch a single product by ID
 * @param {string} id - Product MongoDB _id
 */
export const getProductByIdApi = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product
 * @param {Object} data - { name, description, price, category, image, stock }
 */
export const createProductApi = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

/**
 * Add a product to current user's wishlist
 * @param {string} productId - Product MongoDB _id
 */
export const addToWishlistApi = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Get current authenticated user's populated wishlist
 */
export const getWishlistApi = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Remove a product from current user's wishlist
 * @param {string} productId - Product MongoDB _id
 */
export const removeFromWishlistApi = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Add a product to current user's cart (or increment quantity)
 * @param {string} productId - Product MongoDB _id
 */
export const addToCartApi = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Get current authenticated user's populated cart
 */
export const getCartApi = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Update quantity of a product in current user's cart
 * @param {string} productId - Product MongoDB _id
 * @param {number} quantity - New quantity integer >= 1
 */
export const updateCartQuantityApi = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove a product from current user's cart
 * @param {string} productId - Product MongoDB _id
 */
export const removeFromCartApi = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

/**
 * Clear all items from current user's cart
 */
export const clearCartApi = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

/**
 * Validate cart, calculate price on server, and create pending ShopKart order + Razorpay order
 * @param {Object} data - { shippingAddress: { fullName, phone, addressLine1, city, state, pincode } }
 */
export const createPaymentOrderApi = async (data) => {
  const response = await api.post('/orders/create-payment-order', data);
  return response.data;
};

/**
 * Verify Razorpay payment signature and confirm ShopKart order
 * @param {Object} data - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyPaymentApi = async (data) => {
  const response = await api.post('/orders/verify-payment', data);
  return response.data;
};

/**
 * Fetch all orders belonging to authenticated user
 */
export const getOrdersApi = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Fetch single order details by ID
 * @param {string} id - Order MongoDB _id
 */
export const getOrderByIdApi = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Update order status (Bonus development status progression)
 * @param {string} id - Order MongoDB _id
 * @param {string} status - New status ('PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED')
 */
export const updateOrderStatusApi = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default api;

