import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/api';
import CheckoutForm from '../components/CheckoutForm';
import OrderSummary from '../components/OrderSummary';
import PaymentSimulatorModal from '../components/PaymentSimulatorModal';
import { ShoppingBag, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalItems, cartCount, subtotal, resetCartState, loading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Simulator state
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorOrderData, setSimulatorOrderData] = useState(null);

  // Prefill user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Handle field input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for that field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) setServerError(null);
  };

  // Validate form client-side
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
        newErrors.phone = 'Phone should contain a valid 10-digit number format';
      }
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Execute Simulated Test Payment (Success)
  const handleSimulateSuccess = async () => {
    if (!simulatorOrderData) return;
    setIsProcessing(true);
    setServerError(null);

    try {
      const mockPaymentId = `pay_mock_${Date.now()}`;
      const verifyRes = await verifyPaymentApi({
        shopKartOrderId: simulatorOrderData.shopKartOrderId,
        razorpay_order_id: simulatorOrderData.razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'test_simulated_sig'
      });

      if (verifyRes.success) {
        setShowSimulator(false);
        resetCartState();
        navigate(`/order-success/${simulatorOrderData.shopKartOrderId}`);
      } else {
        setServerError(verifyRes.message || 'Payment verification failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setServerError(
        err.response?.data?.message || 'Payment verification failed. Your cart has been preserved.'
      );
      setIsProcessing(false);
    }
  };

  // Execute Simulated Test Payment (Failure)
  const handleSimulateFailure = () => {
    setShowSimulator(false);
    setIsProcessing(false);
    setServerError('Test Payment was declined / simulated as failed. Your cart items are preserved.');
  };

  // Handle Checkout & Razorpay Payment
  const handlePlaceOrder = async () => {
    setServerError(null);

    // 1. Client-side validation
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setServerError('Your cart is empty. Please add products before placing an order.');
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Call backend to validate stock, calculate real price, and create ShopKart pending order + Razorpay order
      const createRes = await createPaymentOrderApi({
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        }
      });

      if (!createRes.success) {
        setServerError(createRes.message || 'Failed to initiate order.');
        setIsProcessing(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = createRes;

      // Check if using demo placeholder key
      const isPlaceholderKey = !key || key.includes('5173ShopKart01') || key.includes('rzp_test_placeholder');

      if (isPlaceholderKey) {
        // Open Built-in Sandbox Simulator Modal directly for placeholder keys
        setSimulatorOrderData(createRes);
        setShowSimulator(true);
        setIsProcessing(false);
        return;
      }

      // 3. Load Razorpay Checkout Script for real configured key
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
        // Fallback to simulator
        setSimulatorOrderData(createRes);
        setShowSimulator(true);
        setIsProcessing(false);
        return;
      }

      // 4. Configure Razorpay Standard Checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `ShopKart Order #${shopKartOrderId.slice(-6)}`,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80',
        order_id: razorpayOrderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || ''
        },
        notes: {
          shopKartOrderId: shopKartOrderId
        },
        theme: {
          color: '#4f46e5'
        },
        handler: async function (response) {
          try {
            // 5. Send returned payment identifiers to backend for signature verification
            const verifyRes = await verifyPaymentApi({
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              // 6. Signature verified -> Clear global cart state and redirect to confirmation
              resetCartState();
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setServerError(verifyRes.message || 'Payment verification failed.');
              setIsProcessing(false);
            }
          } catch (vErr) {
            console.error('Payment verification failed:', vErr);
            setServerError(
              vErr.response?.data?.message || 'Payment signature verification failed. Your cart has been preserved.'
            );
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setServerError('Payment checkout was closed. Your cart has not been cleared.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        setIsProcessing(false);
        // If it failed due to invalid key or auth, open the simulator
        setSimulatorOrderData(createRes);
        setShowSimulator(true);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Order creation error:', err);
      setIsProcessing(false);
      setServerError(
        err.response?.data?.message || 'Failed to place order. Please check item stock and try again.'
      );
    }
  };

  // If cart is empty and not loading
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="checkout-empty-state">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-sm">
          <div className="w-18 h-18 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
            You cannot proceed to checkout without any products in your cart.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200/80">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl" id="checkout-heading">
            Checkout
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Enter your shipping address and complete payment via Razorpay Test Mode.
          </p>
        </div>

        {/* Global Error Banner if any */}
        {serverError && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fade-in" id="checkout-server-error">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Checkout Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <CheckoutForm
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              disabled={isProcessing}
            />
          </div>

          {/* Right Column: Order Summary & Pay CTA */}
          <div className="lg:col-span-5">
            <OrderSummary
              cartItems={cartItems}
              totalItems={totalItems}
              cartCount={cartCount}
              subtotal={subtotal}
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
              error={serverError}
            />
          </div>

        </div>

      </div>

      {/* Development Sandbox / Simulator Modal */}
      <PaymentSimulatorModal
        isOpen={showSimulator}
        onClose={() => {
          setShowSimulator(false);
          setIsProcessing(false);
        }}
        orderData={simulatorOrderData}
        onSimulateSuccess={handleSimulateSuccess}
        onSimulateFailure={handleSimulateFailure}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default Checkout;
