import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services/wishlistService';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, ArrowLeft, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';

const WishlistPage = () => {
  const { refreshWishlist } = useWishlist();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistService.getWishlist();
      setListings(data || []);
      refreshWishlist();
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError('Could not load your saved listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = (listingId) => {
    setListings((prev) => prev.filter((item) => item.id !== listingId));
    refreshWishlist();
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/browse"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#64748b',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={20} fill="#ffffff" />
              </div>
              <h1 style={{ fontSize: '2rem', margin: 0, letterSpacing: '-0.02em', color: '#09090b' }}>
                Saved Listings &amp; Wishlist
              </h1>
            </div>
            <p style={{ color: '#71717a', fontSize: '0.95rem', margin: 0 }}>
              Keep track of items you plan to buy or want to compare across campus sellers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                fontWeight: 700,
                fontSize: '0.875rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '20px',
                border: '1px solid #e4e4e7',
              }}
            >
              {listings.length} Saved {listings.length === 1 ? 'Item' : 'Items'}
            </span>
            <Link to="/browse" className="btn btn-primary btn-sm">
              <ShoppingBag size={15} /> Find More Items
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '1rem',
              color: '#b91c1c',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '2rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '4rem 0' }}>
            <LoadingSpinner message="Loading your saved wishlist..." />
          </div>
        ) : listings.length === 0 ? (
          /* Empty State */
          <div
            className="card"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '560px',
              margin: '2rem auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid #e4e4e7',
              }}
            >
              <Heart size={36} color="#09090b" fill="#09090b" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#09090b' }}>
              Your Wishlist is Empty
            </h3>
            <p style={{ color: '#71717a', fontSize: '0.95rem', maxWidth: '420px', marginBottom: '1.75rem' }}>
              Explore textbooks, electronics, dorm gear, and lab supplies. Click the heart icon on any listing to save it here for later!
            </p>
            <Link to="/browse" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} /> Browse Marketplace
            </Link>
          </div>
        ) : (
          /* Saved Listings Grid */
          <div className="grid-listings">
            {listings.map((item) => (
              <ProductCard
                key={item.id}
                listing={item}
                onRemoveFromWishlist={handleRemoveFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
