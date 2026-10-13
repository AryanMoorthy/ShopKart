import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, Tag, Box, AlertCircle, Heart } from 'lucide-react';

const WishlistCard = ({ product, onRemove, isRemoving }) => {
  const { _id, name, price, category, image, stock } = product;

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <div 
      id={`wishlist-card-${_id}`}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-200 transition-all duration-300 overflow-hidden"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        <img
          src={image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/95 backdrop-blur-md text-indigo-700 rounded-lg shadow-xs border border-indigo-100">
            <Tag className="w-3 h-3 text-indigo-500" />
            {category}
          </span>
        </div>

        {/* Wishlist Active Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-2">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-rose-600 transition-colors line-clamp-1" title={name}>
            {name}
          </h3>
        </div>

        {/* Stock status */}
        <div className="mb-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Box className="w-3 h-3" />
              Only {stock} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Box className="w-3 h-3" />
              {stock} units in stock
            </span>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-baseline justify-between mt-auto mb-4 pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Action Buttons: View Details & Remove */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/products/${_id}`}
            id={`wishlist-view-${_id}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 active:scale-[0.98]"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            id={`wishlist-remove-${_id}`}
            onClick={() => onRemove(_id)}
            disabled={isRemoving}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            title="Remove from Wishlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isRemoving ? 'Removing...' : 'Remove'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
