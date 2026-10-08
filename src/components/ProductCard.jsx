import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { DEFAULT_PLACEHOLDER_IMAGE, getCategoryPlaceholder, sanitizeImageUrl } from '../utils/constants';
import { User, MapPin, Tag, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ listing, onRemoveFromWishlist }) => {
  const navigate = useNavigate();
  const { isSaved, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const fallbackImg = getCategoryPlaceholder(listing.category);
  const initialImg = sanitizeImageUrl(listing.imageUrl) || fallbackImg;
  const [imgSrc, setImgSrc] = useState(initialImg);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const clean = sanitizeImageUrl(listing.imageUrl);
    setImgSrc(clean || getCategoryPlaceholder(listing.category));
  }, [listing.imageUrl, listing.category]);

  const isSold = listing.status === 'SOLD';
  const saved = isSaved(listing.id);
  const isOwner = user?.id && Number(listing.sellerId || listing.sellerUserId) === Number(user.id);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      alert("This is your own listing! You don't need to add it to your wishlist.");
      return;
    }

    setSaving(true);
    try {
      await toggleWishlist(listing.id);
      if (onRemoveFromWishlist && saved) {
        onRemoveFromWishlist(listing.id);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`product-card ${isSold ? 'sold-card' : ''}`}>
      <div className="card-img-wrapper">
        <img
          src={imgSrc}
          alt={listing.title}
          className="card-img"
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== fallbackImg) {
              setImgSrc(fallbackImg);
            }
          }}
          loading="lazy"
        />

        {/* Sold Badge */}
        {isSold && (
          <div className="sold-banner">
            SOLD
          </div>
        )}

        {/* Wishlist / Save Heart Button */}
        {!isOwner && (
          <button
            type="button"
            onClick={handleHeartClick}
            disabled={saving}
            className={`wishlist-heart-btn ${saved ? 'active' : ''}`}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            title={saved ? 'Saved to Wishlist (Click to remove)' : 'Save to Wishlist'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: saved ? '#09090b' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(6px)',
              border: saved ? '1px solid #09090b' : '1px solid rgba(228, 228, 231, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
              zIndex: 3,
              color: saved ? '#ffffff' : '#71717a',
              transform: saving ? 'scale(0.88)' : 'scale(1)',
            }}
          >
            <Heart
              size={17}
              fill={saved ? '#ffffff' : 'none'}
              color={saved ? '#ffffff' : '#09090b'}
              strokeWidth={saved ? 2.5 : 2}
            />
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="card-category">
          <span className="badge badge-category">
            <Tag size={12} /> {listing.categoryDisplayName || listing.category}
          </span>
          {listing.conditionType && (
            <span className="badge badge-condition">
              {listing.conditionType}
            </span>
          )}
        </div>

        <h3 className="card-title" title={listing.title}>
          <Link to={`/listings/${listing.id}`}>
            {listing.title}
          </Link>
        </h3>

        <div className="card-price">
          {formatPrice(listing.price)}
        </div>

        <div className="card-seller">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
            <User size={14} color="#71717a" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.sellerName || 'Student Seller'}
            </span>
            {listing.sellerId && (
              <span style={{ fontSize: '0.7rem', color: '#09090b', fontWeight: 700, backgroundColor: '#f4f4f5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #e4e4e7' }}>
                #{listing.sellerId}
              </span>
            )}
          </div>
          {listing.sellerCampus && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#71717a' }}>
              <MapPin size={12} color="#a1a1aa" />
              <span>{listing.sellerCampus}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: '0.9rem' }}>
          <Link
            to={`/listings/${listing.id}`}
            className={`btn btn-sm ${isSold ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%' }}
          >
            {isSold ? 'View Archive' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
