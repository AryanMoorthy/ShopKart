import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCartApi,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi,
  clearCartApi
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCartApi();
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.response?.data?.message || 'Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Synchronize cart state on auth change
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add a product to cart (or increment quantity)
  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please sign in to add products to your cart' };
    }

    setActionLoadingId(productId);
    setError(null);

    try {
      const data = await addToCartApi(productId);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true, message: data.message || 'Product added to cart' };
      }
      return { success: false, message: 'Failed to update cart' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add product to cart';
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update product quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please sign in to modify cart' };
    }

    if (newQuantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' };
    }

    setActionLoadingId(productId);
    setError(null);

    try {
      const data = await updateCartQuantityApi(productId, newQuantity);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true, message: data.message || 'Cart updated' };
      }
      return { success: false, message: 'Failed to update quantity' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove a product from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please sign in to modify cart' };
    }

    setActionLoadingId(productId);
    setError(null);

    try {
      const data = await removeFromCartApi(productId);
      if (data.success && Array.isArray(data.cart)) {
        setCartItems(data.cart);
        return { success: true, message: data.message || 'Product removed from cart' };
      }
      // Fallback: local filter if backend returns empty/diff
      setCartItems((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      return { success: true, message: 'Product removed from cart' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove product from cart';
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Clear entire cart from backend and reset state
  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await clearCartApi();
      setCartItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  // Immediate local state reset after verified order creation
  const resetCartState = useCallback(() => {
    setCartItems([]);
  }, []);

  // Derived values
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.product?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [cartItems]);

  // Helper functions
  const getItemQuantity = useCallback((productId) => {
    const found = cartItems.find((item) => (item.product?._id || item.product) === productId);
    return found ? found.quantity : 0;
  }, [cartItems]);

  const isInCart = useCallback((productId) => {
    return cartItems.some((item) => (item.product?._id || item.product) === productId);
  }, [cartItems]);

  const isItemLoading = useCallback((productId) => {
    return actionLoadingId === productId;
  }, [actionLoadingId]);

  const value = {
    cartItems,
    loading,
    error,
    actionLoadingId,
    cartCount,
    totalItems,
    subtotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    resetCartState,
    getItemQuantity,
    isInCart,
    isItemLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
