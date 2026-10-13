import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Sparkles, CreditCard, Lock } from 'lucide-react';

const OrderSummary = ({
  cartItems = [],
  totalItems = 0,
  cartCount = 0,
  subtotal = 0,
  onPlaceOrder,
  isProcessing = false,
  error = null
}) => {
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6 sticky top-24">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2" id="order-summary-title">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Order Summary</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review your items and final pricing snapshot</p>
      </div>

      {/* Items list snapshot */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 border-t border-slate-100 pt-4" id="checkout-items-list">
        {cartItems.map((item) => {
          const product = item.product || {};
          const itemPrice = Number(product.price) || 0;
          const itemQty = Number(item.quantity) || 1;
          return (
            <div
              key={product._id || item._id}
              className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[170px]">
                    {product.name}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {formatINR(itemPrice)} × {itemQty}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900">
                  {formatINR(itemPrice * itemQty)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
        <div className="flex justify-between text-slate-600">
          <span>Distinct Products</span>
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

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-fade-in" id="checkout-error-banner">
          {error}
        </div>
      )}

      {/* Place Order CTA */}
      <button
        id="place-order-btn"
        onClick={onPlaceOrder}
        disabled={isProcessing || cartItems.length === 0}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
            <span>Securing Payment & Placing Order...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Pay with Razorpay ({formatINR(subtotal)})</span>
          </>
        )}
      </button>

      {/* Security & Test Mode Notice */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
          <Lock className="w-4 h-4 shrink-0 text-indigo-600" />
          <span>
            <strong>Razorpay Test Mode</strong>: Simulated transactions. No real money deducted.
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>256-bit SSL encrypted secure checkout</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Fast express doorstep delivery</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
