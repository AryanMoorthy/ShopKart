import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Tag, Box, AlertCircle, Loader2 } from 'lucide-react';

const CartItem = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false
}) => {
  const { product, quantity } = item;

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  // Format single unit price
  const formattedUnitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

  // Format line item subtotal
  const formattedLineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((price || 0) * (quantity || 1));

  const isAtMaxStock = quantity >= stock;
  const isAtMinQuantity = quantity <= 1;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleDecrease = () => {
    if (isAtMinQuantity || isUpdating) return;
    onUpdateQuantity(_id, quantity - 1);
  };

  const handleIncrease = () => {
    if (isAtMaxStock || isUpdating) return;
    onUpdateQuantity(_id, quantity + 1);
  };

  const handleRemove = () => {
    if (isUpdating) return;
    onRemove(_id);
  };

  return (
    <div
      id={`cart-item-${_id}`}
      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 gap-4 ${
        isUpdating ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      {/* Left side: Product Image + Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Link
          to={`/products/${_id}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 group border border-slate-100"
        >
          <img
            src={image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
            alt={name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              <Tag className="w-2.5 h-2.5" />
              {category}
            </span>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-2.5 h-2.5" />
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                <Box className="w-2.5 h-2.5" />
                Only {stock} left
              </span>
            ) : null}
          </div>

          <Link
            to={`/products/${_id}`}
            className="block font-bold text-slate-900 text-sm sm:text-base hover:text-indigo-600 transition-colors line-clamp-1"
            title={name}
          >
            {name}
          </Link>

          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            {formattedUnitPrice} <span className="text-slate-400">each</span>
          </p>
        </div>
      </div>

      {/* Right side: Quantity Controls, Row Total & Remove */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        
        {/* Quantity Controls [-] Qty [+] */}
        <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200">
          <button
            id={`cart-qty-decrease-${_id}`}
            onClick={handleDecrease}
            disabled={isAtMinQuantity || isUpdating}
            className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-90 cursor-pointer"
            title={isAtMinQuantity ? 'Quantity cannot be less than 1' : 'Decrease quantity'}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span
            id={`cart-qty-val-${_id}`}
            className="w-10 text-center text-sm font-bold text-slate-900 select-none"
          >
            {quantity}
          </span>

          <button
            id={`cart-qty-increase-${_id}`}
            onClick={handleIncrease}
            disabled={isAtMaxStock || isUpdating}
            className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-90 cursor-pointer"
            title={isAtMaxStock ? `Stock limit reached (${stock} max)` : 'Increase quantity'}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row Subtotal Calculation */}
        <div className="text-right min-w-[90px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block sm:hidden">Total</span>
          <span
            id={`cart-item-total-${_id}`}
            className="text-base sm:text-lg font-black text-slate-900 tracking-tight block"
          >
            {formattedLineTotal}
          </span>
        </div>

        {/* Remove Button */}
        <button
          id={`cart-remove-btn-${_id}`}
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          title="Remove from Cart"
          aria-label="Remove item from cart"
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>

      </div>
    </div>
  );
};

export default CartItem;
