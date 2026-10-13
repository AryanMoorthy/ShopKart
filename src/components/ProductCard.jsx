import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Box, AlertCircle, Heart, ShoppingCart, Loader2, Plus, Check } from 'lucide-react';
import { addToWishlistApi, removeFromWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isInitiallyWishlisted = false, onWishlistChange }) => {
  const { _id, name, price, category, image, stock } = product;
  const { isAuthenticated } = useAuth();
  const { addToCart, getItemQuantity, isItemLoading } = useCart();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [cardFeedback, setCardFeedback] = useState(null);

  // Format price in Indian Rupee format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const cartQty = getItemQuantity(_id);
  const isAddingToCart = isItemLoading(_id);
  const isMaxStockInCart = cartQty >= stock;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    setWishlistError(null);
    setCardFeedback(null);

    try {
      if (isWishlisted) {
        await removeFromWishlistApi(_id);
        setIsWishlisted(false);
        setCardFeedback({ type: 'info', text: 'Removed from Wishlist' });
        if (onWishlistChange) onWishlistChange(_id, false);
      } else {
        await addToWishlistApi(_id);
        setIsWishlisted(true);
        setCardFeedback({ type: 'success', text: '♥ Added to Wishlist' });
        if (onWishlistChange) onWishlistChange(_id, true);
      }
      setTimeout(() => setCardFeedback(null), 2500);
    } catch (err) {
      console.error('Wishlist action failed:', err);
      const msg = err.response?.data?.message || 'Unable to save product. Please try again.';
      setWishlistError(msg);
      setTimeout(() => setWishlistError(null), 3500);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock || isAddingToCart || isMaxStockInCart) return;

    const res = await addToCart(_id);
    if (res.success) {
      setCardFeedback({ type: 'success', text: cartQty > 0 ? `Added! (${cartQty + 1} in cart)` : 'Added to Cart 🛒' });
      setTimeout(() => setCardFeedback(null), 3000);
    } else {
      setCardFeedback({ type: 'error', text: res.message });
      setTimeout(() => setCardFeedback(null), 3500);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        <Link to={`/products/${_id}`} className="w-full h-full block">
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
        </Link>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur-md text-indigo-700 rounded-lg shadow-xs border border-indigo-100">
            <Tag className="w-3 h-3 text-indigo-500" />
            {category}
          </span>
        </div>

        {/* Floating Quick Wishlist Heart Icon */}
        <button
          id={`wishlist-icon-btn-${_id}`}
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 scale-105'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white border border-slate-200/80'
          } ${isWishlistLoading ? 'opacity-75 cursor-not-allowed' : 'active:scale-90'}`}
        >
          {isWishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          )}
        </button>

        {/* In-Cart badge overlay if present */}
        {cartQty > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-md animate-fade-in">
              <Check className="w-3 h-3" />
              <span>{cartQty} in Cart</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-5">
        <Link to={`/products/${_id}`} className="block">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2" title={name}>
            {name}
          </h3>
        </Link>

        {/* Stock & Feedback status */}
        <div className="flex items-center justify-between gap-2 mb-3 min-h-[22px]">
          {cardFeedback ? (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md animate-fade-in ${
                cardFeedback.type === 'error'
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-emerald-700 bg-emerald-50'
              }`}
            >
              {cardFeedback.text}
            </span>
          ) : wishlistError ? (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md animate-fade-in line-clamp-1" title={wishlistError}>
              {wishlistError}
            </span>
          ) : isOutOfStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md animate-pulse">
              <Box className="w-3 h-3" />
              Only {stock} left!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Box className="w-3 h-3" />
              {stock} units left
            </span>
          )}
        </div>

        {/* Price & Status Row */}
        <div className="flex items-baseline justify-between mt-auto mb-4 pt-2 border-t border-slate-100">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">
              {isOutOfStock ? (
                <span className="text-rose-600">Unavailable</span>
              ) : (
                <span className="text-emerald-600">In Stock</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart (Task 7) & View Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Add to Cart Primary Action */}
          <button
            id={`add-to-cart-btn-${_id}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart || isMaxStockInCart}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isMaxStockInCart
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : cartQty > 0
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                : 'text-white gradient-brand hover:opacity-95 shadow-sm shadow-indigo-500/20'
            } ${isAddingToCart ? 'opacity-75 cursor-wait' : ''}`}
            title={isOutOfStock ? 'Product is out of stock' : isMaxStockInCart ? 'Maximum stock reached in cart' : 'Add to cart'}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
                <span>Adding...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isMaxStockInCart ? (
              <span>Max in Cart</span>
            ) : cartQty > 0 ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* View Details CTA Button */}
          <Link
            to={`/products/${_id}`}
            id={`view-details-${_id}`}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all duration-200 active:scale-[0.98]"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
