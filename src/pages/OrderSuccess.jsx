import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByIdApi } from '../services/api';
import {
  CheckCircle2,
  ShoppingBag,
  PackageCheck,
  ArrowRight,
  Clock,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  Receipt
} from 'lucide-react';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderByIdApi(id);
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(err.response?.data?.message || 'Failed to retrieve order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleCopyId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50" id="order-success-loading">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-base font-bold text-slate-800">Generating your order confirmation...</p>
        <p className="text-xs text-slate-400 mt-1">Verifying payment with bank servers</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="order-success-error">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Unable to load order details.'}</p>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
          >
            <span>View All My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            Payment Verified & Received
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" id="order-success-title">
            Order Placed Successfully! 🎉
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mt-2">
            Thank you for shopping with ShopKart. Your order has been placed and is now being prepared for dispatch.
          </p>

          {/* Key Metrics Bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-left">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-slate-800 truncate" id="success-order-id">
                  {order._id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors shrink-0"
                  title="Copy Order ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
              <span className="text-lg font-black text-indigo-600 mt-1 block" id="success-total-amount">
                {formatINR(order.totalAmount)}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-slate-800 uppercase" id="success-order-status">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/orders"
              id="view-my-orders-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>View My Orders</span>
            </Link>

            <Link
              to="/products"
              id="continue-shopping-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Purchased Items Snapshot */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-indigo-600" />
              <span>Items in this Order ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatINR(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 text-sm">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-700">Total Paid (INR)</span>
              <span className="text-xl font-black text-indigo-600">{formatINR(order.totalAmount)}</span>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Delivery Address</span>
              </h3>
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-800">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Details</span>
              </h3>
              <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method</span>
                  <span className="font-bold text-slate-700">Razorpay Standard</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment ID</span>
                    <span className="font-mono text-[10px] text-slate-700">{order.razorpayPaymentId}</span>
                  </div>
                )}
                {order.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Razorpay Order</span>
                    <span className="font-mono text-[10px] text-slate-700">{order.razorpayOrderId}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
