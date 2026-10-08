import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listingService } from '../services/listingService';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { SORT_OPTIONS } from '../utils/constants';
import { SlidersHorizontal, RefreshCw, CheckCircle2 } from 'lucide-react';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state from query parameters or defaults
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialStatus = searchParams.get('status') || '';

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [status, setStatus] = useState(initialStatus);

  // Sync state when URL searchParams changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'ALL';
    const s = searchParams.get('search') || '';
    const st = searchParams.get('sort') || 'newest';
    const stat = searchParams.get('status') || '';

    setCategory(cat);
    setSearch(s);
    setSort(st);
    setStatus(stat);
  }, [searchParams]);

  // Fetch listings from backend
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getListings({
        search,
        category,
        sort,
        status: status || undefined,
      });
      setListings(data || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
      setError('Unable to load listings from server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, search, sort, status]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    updateParam('category', newCat);
  };

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    updateParam('search', newSearch);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateParam('sort', newSort);
  };

  const handleStatusToggle = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    updateParam('status', newStatus);
  };

  const handleResetFilters = () => {
    setCategory('ALL');
    setSearch('');
    setSort('newest');
    setStatus('');
    setSearchParams({});
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Title & Search Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Campus Marketplace
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Browse available textbooks, devices, gear, and supplies from college students.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchBar
              onSearch={handleSearchChange}
              initialValue={search}
              placeholder="Search by title, author, or description..."
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CategoryFilter
            selectedCategory={category}
            onSelectCategory={handleCategoryChange}
          />
        </div>

        {/* Filter Controls & Sort Bar */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
              <SlidersHorizontal size={17} /> Filters:
            </div>

            {/* Availability Filter */}
            <select
              value={status}
              onChange={handleStatusToggle}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.85rem', fontSize: '0.875rem' }}
            >
              <option value="">All Statuses (Available &amp; Sold)</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="SOLD">Sold Archive</option>
            </select>

            {(category !== 'ALL' || search || status) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-sm btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}
              >
                <RefreshCw size={13} /> Clear Filters
              </button>
            )}
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
              Sort by:
            </span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.85rem', fontSize: '0.875rem' }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Stats */}
        {!loading && !error && (
          <div style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: '#64748b' }}>
            Showing <strong>{listings.length}</strong> {listings.length === 1 ? 'item' : 'items'}
            {category !== 'ALL' && <span> in <strong>{category.replace('_', ' ')}</strong></span>}
            {search && <span> matching "<strong>{search}</strong>"</span>}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Loading marketplace items..." />
        ) : error ? (
          <EmptyState
            title="Connection Error"
            message={error}
            actionText="Try Again"
            onAction={fetchListings}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            title="No matching listings found"
            message="No products match your current search terms or category filter. Try clearing filters or search for something else."
            actionText="Clear All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid-listings">
            {listings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
