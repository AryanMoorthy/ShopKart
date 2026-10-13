import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import {
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  Truck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    actionLoadingId,
    cartCount,
    totalItems,
    subtotal,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Format currency in INR
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const res = await updateQuantity(productId, newQuantity);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.message });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (res.success) {
      setFeedback({ type: 'success', text: 'Item removed from cart' });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: 'error', text: res.message });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
      setFeedback({ type: 'success', text: 'Cart has been cleared' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // 1. Loading State
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50" id="cart-loading-state">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <ShoppingCart className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-base font-bold text-slate-800" id="cart-loading-text">
          Loading your cart...
        </p>
        <p className="text-xs text-slate-400 mt-1">Calculating prices and checking inventory</p>
      </div>
    );
  }

  // 2. Error State
  if (!loading && error && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="cart-error-state">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load your cart</h2>
          <p className="text-sm text-slate-500 mb-6" id="cart-error-text">
            {error || 'Something went wrong while loading your shopping cart.'}
          </p>
          <button
            id="cart-retry-button"
            onClick={fetchCart}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty Cart State
  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="cart-empty-state">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3" id="cart-empty-title">
            Your cart is empty 🛒
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto mb-8">
            Looks like you haven't added anything to your cart yet. Explore our latest collection and find something you love.
          </p>
          <Link
            to="/products"
            id="cart-browse-products-btn"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
              <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shopping Cart</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl" id="cart-heading">
              My Cart
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
              Review your items, adjust quantities, and proceed to secure checkout.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span
              id="cart-total-badge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs"
            >
              <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-bold">{cartCount} {cartCount === 1 ? 'unit' : 'units'}</span>
            </span>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Cart Items (Left) + Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-3" id="cart-items-container">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product?._id || item._id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  isUpdating={actionLoadingId === (item.product?._id || item.product)}
                />
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>

              <button
                id="clear-cart-button"
                onClick={handleClearCart}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
              
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2" id="order-summary-title">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Order Summary</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review your total before checkout</p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Distinct Items</span>
                  <span className="font-semibold text-slate-900" id="summary-items-count">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Total Units</span>
                  <span className="font-semibold text-slate-900" id="summary-units-count">
                    {cartCount}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900" id="summary-subtotal">
                    {formatINR(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 items-center">
                  <span className="flex items-center gap-1">
                    <span>Delivery</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-md">
                      Free
                    </span>
                  </span>
                  <span className="text-emerald-600 font-semibold">₹0</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600 tracking-tight" id="summary-total-amount">
                    {formatINR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                id="proceed-to-checkout-btn"
                onClick={() => navigate('/checkout')}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Badges */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Free express delivery on all orders</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Safe & Secure 256-Bit Encrypted Payments</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
