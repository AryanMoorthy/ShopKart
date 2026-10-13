import React from 'react';
import { User, Phone, MapPin, Building, Globe, Mailbox } from 'lucide-react';

const CheckoutForm = ({
  formData,
  errors,
  onChange,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2" id="shipping-heading">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <span>Shipping Details</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Please enter your full delivery address where the items will be dispatched.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. Aarav Sharma"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.fullName
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-fullName">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div className="sm:col-span-2">
          <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. 9876543210 (10 digits)"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.phone
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-phone">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label htmlFor="addressLine1" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Address Line (House / Flat / Street) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. 22 MG Road, Koramangala"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.addressLine1
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.addressLine1 && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-addressLine1">
              {errors.addressLine1}
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            City <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. Bengaluru"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.city
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.city && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-city">
              {errors.city}
            </p>
          )}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            State <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. Karnataka"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.state
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.state && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-state">
              {errors.state}
            </p>
          )}
        </div>

        {/* Pincode */}
        <div className="sm:col-span-2">
          <label htmlFor="pincode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pincode (6 digits) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mailbox className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="pincode"
              name="pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={onChange}
              disabled={disabled}
              placeholder="e.g. 560001"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-hidden ${
                errors.pincode
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.pincode && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium" id="error-pincode">
              {errors.pincode}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CheckoutForm;
