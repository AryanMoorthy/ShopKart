import React, { useState, useEffect, useCallback } from 'react';
import { getProductsApi, getWishlistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { ShoppingBag, AlertCircle, RefreshCw, Sparkles, PackageSearch, Layers } from 'lucide-react';

const Products = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState('');

  // Debounce search input by 350ms to prevent spamming backend requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch wishlist IDs if user is authenticated
  const fetchUserWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const data = await getWishlistApi();
      if (data.success && Array.isArray(data.wishlist)) {
        setWishlistIds(new Set(data.wishlist.map((item) => item._id)));
      }
    } catch (err) {
      // non-critical
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserWishlist();
  }, [fetchUserWishlist]);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsApi({
        search: debouncedSearch,
        category: selectedCategory,
        sort: selectedSort,
      });

      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(
        err.response?.data?.message || 'Something went wrong while loading products.'
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('All Categories');
    setSelectedSort('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Catalog & Discovery</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Explore Our Products
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-2xl">
              Browse top-tier electronics, fashion, books, and home essentials with real-time discovery.
            </p>
          </div>

          {/* Product counter badge */}
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{loading ? 'Finding products...' : `${products.length} Products Available`}</span>
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          onResetFilters={handleResetFilters}
        />

        {/* UI State Handling */}
        
        {/* 1. Loading State */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <ShoppingBag className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-base font-semibold text-slate-700" id="loading-state-text">
              Loading products...
            </p>
            <p className="text-xs text-slate-400 mt-1">Connecting to ShopKart Catalog API</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="my-8 p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-900 mb-1">
              Failed to Load Products
            </h3>
            <p className="text-sm text-rose-600 mb-6" id="error-state-text">
              {error}
            </p>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="py-16 px-4 bg-white border border-slate-200/80 rounded-2xl text-center max-w-md mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1" id="empty-state-text">
              No products found
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              We couldn't find any products matching your search query or filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

        {/* 4. Product Cards Grid */}
        {!loading && !error && products.length > 0 && (
          <div 
            id="products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isInitiallyWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={(id, isAdded) => {
                  setWishlistIds((prev) => {
                    const next = new Set(prev);
                    if (isAdded) next.add(id);
                    else next.delete(id);
                    return next;
                  });
                  window.dispatchEvent(new Event('wishlist-updated'));
                }}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;
