import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlistApi } from '../services/api';
import { 
  ShoppingBag, 
  ShoppingCart,
  LogOut, 
  User, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  Sparkles,
  Heart,
  Package
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count from backend whenever authenticated or route changes
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      if (isAuthenticated) {
        try {
          const data = await getWishlistApi();
          if (isMounted && data.success && Array.isArray(data.wishlist)) {
            setWishlistCount(data.wishlist.length);
          }
        } catch (err) {
          // silently fail for non-critical count display
        }
      } else {
        setWishlistCount(0);
      }
    };

    fetchCount();

    // Listen to custom window event if triggered across components
    const handleWishlistUpdate = () => fetchCount();
    window.addEventListener('wishlist-updated', handleWishlistUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setWishlistCount(0);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to={isAuthenticated ? "/home" : "/products"} 
            className="flex items-center gap-2.5 group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Shop<span className="text-indigo-600">Kart</span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60">
                  Store
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-5">
            <Link
              to="/products"
              id="nav-products-link"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                isActive('/products')
                  ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              Products
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              id="nav-wishlist-link"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                isActive('/wishlist')
                  ? 'text-rose-600 bg-rose-50 font-bold'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isActive('/wishlist') ? 'fill-rose-500 text-rose-500' : 'text-rose-500'}`} />
              <span>Wishlist</span>
              {isAuthenticated && wishlistCount > 0 && (
                <span 
                  id="nav-wishlist-count" 
                  className="ml-1 px-1.5 py-0.2 text-xs font-extrabold bg-rose-100 text-rose-700 rounded-full"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link with Live Dynamic Count */}
            <Link
              to="/cart"
              id="nav-cart-link"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                isActive('/cart')
                  ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <div className="relative flex items-center">
                <ShoppingCart className="w-4 h-4 text-indigo-500" />
              </div>
              <span>Cart</span>
              {isAuthenticated && (
                <span 
                  id="nav-cart-count" 
                  className={`ml-1 px-1.5 py-0.2 text-xs font-extrabold rounded-full transition-transform duration-200 ${
                    cartCount > 0
                      ? 'bg-indigo-600 text-white shadow-xs scale-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ({cartCount})
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  id="nav-orders-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/orders')
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Package className="w-4 h-4 text-indigo-500" />
                  My Orders
                </Link>

                <Link
                  to="/home"
                  id="nav-dashboard-link"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isActive('/home')
                      ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Dashboard
                </Link>

                {/* Logged in User Pill */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <div className="flex items-center gap-2.5 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {user?.fullName || 'Customer'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    id="logout-button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Log out of ShopKart"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  id="nav-login-link"
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive('/login')
                      ? 'text-indigo-600 bg-indigo-50 font-bold'
                      : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>

                <Link
                  to="/register"
                  id="nav-register-link"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/20 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in shadow-xl">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
          >
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
            Explore Products
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>My Wishlist</span>
            </div>
            {isAuthenticated && (
              <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-500" />
              <span>Shopping Cart</span>
            </div>
            {isAuthenticated && (
              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <Package className="w-4 h-4 text-indigo-500" />
                My Orders
              </Link>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                Home Dashboard
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white gradient-brand rounded-lg shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
