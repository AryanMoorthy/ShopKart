import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, CreditCard, Smartphone, Building2, KeyRound } from 'lucide-react';

const PaymentSimulatorModal = ({
  isOpen,
  onClose,
  orderData,
  onSimulateSuccess,
  onSimulateFailure,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState('card');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  if (!isOpen || !orderData) return null;

  const { shopKartOrderId, razorpayOrderId, amount, currency } = orderData;
  const formattedAmount = (amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in" id="payment-simulator-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/60 flex items-center justify-center border border-indigo-400/30">
                <ShieldCheck className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <span className="font-black tracking-wider text-sm uppercase text-indigo-200">ShopKart Sandbox</span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold uppercase">
                  Test Simulator
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-indigo-300 hover:text-white p-1 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex items-baseline justify-between mt-4">
            <div>
              <p className="text-xs text-indigo-300 font-medium">Total Payable</p>
              <p className="text-3xl font-black text-white tracking-tight">{formattedAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-indigo-300">Order ID</p>
              <p className="text-xs font-mono font-bold text-indigo-100 truncate max-w-[150px]">
                #{shopKartOrderId?.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Simulation */}
        <div className="p-6 space-y-5">
          {/* Method Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'card'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upi'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'netbanking'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* Tab Content Mock Previews */}
          {activeTab === 'card' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Test Card Number</span>
                <span className="font-mono font-bold text-slate-800">4111 •••• •••• 1111</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Expiry / CVV</span>
                <span className="font-mono font-bold text-slate-800">12/28 • 123</span>
              </div>
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Virtual Payment Address</span>
                <span className="font-mono font-bold text-slate-800">success@razorpay</span>
              </div>
              <p className="text-[11px] text-slate-400">Instant test UPI authorization enabled.</p>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="grid grid-cols-3 gap-2">
              {['HDFC', 'ICICI', 'SBI'].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                    selectedBank === bank
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {bank} Bank
                </button>
              ))}
            </div>
          )}

          {/* Dev Info Note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Development Sandbox Active</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                Using local simulator mode. To use the live Razorpay modal, provide your active API keys in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">backend/.env</code>.
              </p>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              id="simulator-pay-success-btn"
              onClick={onSimulateSuccess}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying Payment...' : `Authorize Payment (${formattedAmount})`}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="simulator-pay-fail-btn"
                onClick={onSimulateFailure}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulate Failure</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentSimulatorModal;
