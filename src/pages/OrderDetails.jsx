import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByIdApi, updateOrderStatusApi } from '../services/api';
import {
  Package,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrderByIdApi(id);
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyId = () => {
    if (order?._id) {
      navigator.clipboard.writeText(order._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await updateOrderStatusApi(order._id, newStatus);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStep = order ? statuses.indexOf(order.status) : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50" id="order-details-loading">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-base font-bold text-slate-800">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="order-details-error">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Unable to retrieve this order.'}</p>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
          >
            <span>Back to My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>

          {/* Quick Bonus Progression Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-400 font-medium">Update Status:</span>
            <select
              value={order.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-bold text-indigo-600 bg-transparent outline-hidden cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Header Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Order ID</span>
                <span className="text-sm font-mono font-bold text-slate-800" id="order-details-id">
                  {order._id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
                  title="Copy ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Placed on {formatDate(order.createdAt)}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {order.status}
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Delivery Progression Timeline */}
          <div className="pt-8 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Delivery Progress</h3>
            <div className="grid grid-cols-4 gap-2 relative">
              {statuses.map((step, index) => {
                const isPassed = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <div key={step} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-50'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 font-bold tracking-tight ${
                        isCurrent ? 'text-indigo-600' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Purchased Items List */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Purchased Items Snapshot ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatINR(item.price)} × {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Delivery</span>
                <span className="text-emerald-600 font-semibold">Free (₹0)</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-900">Total Paid</span>
                <span className="text-2xl font-black text-indigo-600">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Shipping Address</span>
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

            {/* Payment Record */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Record</span>
              </h3>
              <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
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

export default OrderDetails;
