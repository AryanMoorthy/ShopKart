import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
  'Sports',
];

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSort,
  setSelectedSort,
  onResetFilters,
}) => {
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All Categories' || selectedSort !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-8">
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center">
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="product-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls Row */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          
          {/* Category Dropdown */}
          <div className="relative min-w-[170px] flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              id="category-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown (Bonus Requirement) */}
          <div className="relative min-w-[170px] flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              id="sort-filter-select"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              id="reset-filters-button"
              className="px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

        </div>

      </div>
    </div>
  );
};

export default SearchBar;
