import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersApi, updateOrderStatusApi } from '../services/api';
import {
  Package,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrdersApi();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.response?.data?.message || 'Unable to load your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Bonus helper: Update order status progression
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatusApi(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: res.order.status } : ord))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONFIRMED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'PLACED':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50" id="orders-loading-state">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-base font-bold text-slate-800" id="orders-loading-text">
          Loading your order history...
        </p>
        <p className="text-xs text-slate-400 mt-1">Retrieving order snapshots from MongoDB</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="orders-error-state">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load orders</h2>
          <p className="text-sm text-slate-500 mb-6" id="orders-error-text">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50" id="orders-empty-state">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3" id="orders-empty-title">
            You have not placed any orders yet
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
            When you complete checkout and make purchases, your order history and live shipping status will appear here.
          </p>
          <Link
            to="/products"
            id="start-shopping-btn"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand hover:opacity-95 shadow-md shadow-indigo-500/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100">
              <Package className="w-3.5 h-3.5 text-indigo-600" />
              <span>Purchase History</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl" id="orders-heading">
              My Orders
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              View and track all your past and active ShopKart orders.
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs">
              Total: <strong className="text-indigo-600 font-bold">{orders.length}</strong> {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6" id="orders-list">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:shadow-md"
              id={`order-card-${order._id}`}
            >
              {/* Order Header Bar */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Order ID</span>
                    <span className="font-mono font-bold text-slate-800">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Date Placed</span>
                    <span className="font-semibold text-slate-700">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Amount</span>
                    <span className="font-black text-indigo-600">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{order.status}</span>
                  </span>

                  {order.paymentStatus === 'PAID' && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>PAID</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Order Content Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Quantity: <strong className="text-slate-700">{item.quantity}</strong>
                            <span className="mx-1.5 text-slate-300">•</span>
                            Unit Price: <strong className="text-slate-700">{formatINR(item.price)}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls & Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Bonus Status Advancement Demo Control */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Status Demo:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 outline-hidden"
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>

                  {/* View Details Link */}
                  <Link
                    to={`/orders/${order._id}`}
                    id={`view-order-details-${order._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Orders;
