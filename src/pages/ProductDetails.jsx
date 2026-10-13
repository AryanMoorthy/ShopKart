import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductByIdApi, getWishlistApi, addToWishlistApi, removeFromWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Box,
  AlertCircle,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Heart,
  Loader2,
  Plus,
  Check
} from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, getItemQuantity, isItemLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartToast, setCartToast] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState(null);

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductByIdApi(id);
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError('Product not found.');
        }

        if (isAuthenticated) {
          try {
            const wishData = await getWishlistApi();
            if (wishData.success && Array.isArray(wishData.wishlist)) {
              const found = wishData.wishlist.some(item => item._id === id);
              setIsWishlisted(found);
            }
          } catch (e) {
            // non-critical
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(
          err.response?.data?.message || 'Something went wrong while loading product details.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndWishlist();
    }
  }, [id, isAuthenticated]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;

    setWishlistLoading(true);
    setWishlistMessage(null);

    try {
      if (isWishlisted) {
        await removeFromWishlistApi(id);
        setIsWishlisted(false);
        setWishlistMessage({ type: 'success', text: 'Removed from Wishlist' });
      } else {
        await addToWishlistApi(id);
        setIsWishlisted(true);
        setWishlistMessage({ type: 'success', text: '♥ Added to Wishlist' });
      }
      window.dispatchEvent(new Event('wishlist-updated'));
      setTimeout(() => setWishlistMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      setWishlistMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to update wishlist. Please try again.',
      });
      setTimeout(() => setWishlistMessage(null), 3500);
    } finally {
      setWishlistLoading(false);
    }
  };

  const cartQty = getItemQuantity(id);
  const isAddingToCart = isItemLoading(id);
  const isOutOfStock = product ? product.stock <= 0 : false;
  const isMaxStockInCart = product ? cartQty >= product.stock : false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock || isAddingToCart || isMaxStockInCart) return;

    const res = await addToCart(id);
    if (res.success) {
      setCartToast({
        type: 'success',
        text: cartQty > 0 ? `Added another unit! (${cartQty + 1} in cart)` : 'Successfully added to your cart!'
      });
      setTimeout(() => setCartToast(null), 3500);
    } else {
      setCartToast({
        type: 'error',
        text: res.message || 'Failed to add to cart'
      });
      setTimeout(() => setCartToast(null), 4000);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <ShoppingBag className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-base font-semibold text-slate-700" id="product-details-loading">
          Loading product details...
        </p>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Available</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Unable to locate this product.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price || 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Breadcrumb / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            id="back-to-products-button"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          {cartQty > 0 && (
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>View in Cart ({cartQty})</span>
            </Link>
          )}
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Large Product Image */}
          <div className="lg:col-span-6 bg-slate-100/70 p-6 sm:p-10 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-slate-200/80">
            <div className="relative w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-md bg-white">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                id="product-detail-image"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            
            {/* Category floating chip */}
            <div className="absolute top-8 left-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-md text-indigo-700 shadow-sm border border-indigo-100">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                {product.category}
              </span>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              
              {/* Category & ID badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {product._id?.slice(-8)}
                </span>
              </div>

              {/* Product Title */}
              <h1 id="product-detail-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Price</span>
                  <span id="product-detail-price" className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {formattedPrice}
                  </span>
                </div>
                <div className="ml-auto">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Box className="w-3.5 h-3.5" />
                      {product.stock} in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  About this item
                </h3>
                <p id="product-detail-description" className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>

              {/* Product Highlights */}
              <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1 Year Warranty</span>
                </div>
              </div>

            </div>

            {/* Action Buttons & Toast */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {cartToast && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fade-in ${
                    cartToast.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {cartToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{cartToast.text}</span>
                </div>
              )}

              {wishlistMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in ${
                    wishlistMessage.type === 'success'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>{wishlistMessage.text}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Add to Cart Button */}
                <button
                  id="add-to-cart-button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart || isMaxStockInCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isMaxStockInCart
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'text-white gradient-brand hover:opacity-95 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35'
                  } ${isAddingToCart ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding to Cart...</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>Currently Unavailable</span>
                  ) : isMaxStockInCart ? (
                    <span>Max Stock in Cart ({cartQty})</span>
                  ) : cartQty > 0 ? (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Another ({cartQty} in Cart)</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  id="detail-wishlist-button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                  } ${wishlistLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {wishlistLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      <span>Saving...</span>
                    </>
                  ) : isWishlisted ? (
                    <>
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      <span>Saved in Wishlist</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 text-slate-500 hover:text-rose-500" />
                      <span>Add to Wishlist</span>
                    </>
                  )}
                </button>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <span>Browse More</span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
