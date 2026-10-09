import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/formatters';
import { DEFAULT_PLACEHOLDER_IMAGE, getCategoryPlaceholder, sanitizeImageUrl } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ContactSellerModal from '../components/ContactSellerModal';
import {
  Tag,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Book,
  ShieldCheck,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isSaved, toggleWishlist } = useWishlist();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  const saved = isSaved(id);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSavingWishlist(true);
    try {
      await toggleWishlist(id);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    } finally {
      setSavingWishlist(false);
    }
  };

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getListingById(id);
      setListing(data);
      const cleanImg = sanitizeImageUrl(data.imageUrl);
      setImgSrc(cleanImg || getCategoryPlaceholder(data.category));
    } catch (err) {
      console.error('Failed to load listing:', err);
      if (err.response && err.response.status === 404) {
        setError('This listing could not be found. It may have been deleted by the seller.');
      } else {
        setError('Failed to load listing details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const isOwner = Boolean(
    isAuthenticated &&
    user &&
    listing &&
    (user.id === listing.sellerId || user.email === listing.sellerEmail)
  );

  const isSold = listing?.status === 'SOLD';

  const handleMarkAsSold = async () => {
    if (!window.confirm('Mark this listing as SOLD? Other students will see it marked as sold.')) {
      return;
    }

    setActionLoading(true);
    try {
      const updated = await listingService.markAsSold(listing.id);
      setListing(updated);
    } catch (err) {
      console.error('Failed to mark sold:', err);
      alert(err.response?.data?.message || 'Failed to update status. Only the owner can mark it sold.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    setActionLoading(true);
    try {
      await listingService.deleteListing(listing.id);
      navigate('/my-listings');
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing. Only the owner has permission.');
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading listing details..." />;
  }

  if (error || !listing) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <EmptyState
          title="Listing Not Found"
          message={error || 'Unable to locate this item.'}
          actionText="Back to Marketplace"
          actionLink="/browse"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/browse"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#09090b',
              fontWeight: 600,
              fontSize: '0.925rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
        </div>

        {/* Main Product Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Image */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              <img
                src={imgSrc}
                alt={listing.title}
                referrerPolicy="no-referrer"
                onError={() => {
                  const placeholder = getCategoryPlaceholder(listing?.category);
                  if (imgSrc !== placeholder) {
                    setImgSrc(placeholder);
                  }
                }}
                style={{
                  width: '100%',
                  maxHeight: '480px',
                  objectFit: 'contain',
                  backgroundColor: '#f8fafc',
                  display: 'block',
                }}
              />
              {isSold && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  SOLD
                </div>
              )}
            </div>

            {/* Meetup Reminder Box */}
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={24} color="#16a34a" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                <strong>Campus Safe Meetup:</strong> Always arrange exchanges in public campus areas such as the library lobby or dining hall.
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-category" style={{ fontSize: '0.825rem' }}>
                <Tag size={13} /> {listing.categoryDisplayName || listing.category}
              </span>
              {listing.conditionType && (
                <span className="badge badge-condition" style={{ fontSize: '0.825rem' }}>
                  Condition: {listing.conditionType}
                </span>
              )}
              {isSold ? (
                <span className="badge badge-sold" style={{ fontSize: '0.825rem' }}>
                  Status: SOLD
                </span>
              ) : (
                <span className="badge badge-available" style={{ fontSize: '0.825rem' }}>
                  Status: AVAILABLE
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {listing.title}
            </h1>

            <div
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#09090b',
                marginBottom: '1.5rem',
              }}
            >
              {formatPrice(listing.price)}
            </div>

            {/* Book Metadata if Textbook */}
            {(listing.isbn || listing.author) && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#09090b', marginBottom: '0.65rem' }}>
                  <Book size={18} color="#09090b" /> Textbook Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', fontSize: '0.875rem' }}>
                  {listing.author && (
                    <div>
                      <span style={{ color: '#64748b' }}>Author(s): </span>
                      <strong>{listing.author}</strong>
                    </div>
                  )}
                  {listing.isbn && (
                    <div>
                      <span style={{ color: '#64748b' }}>ISBN: </span>
                      <strong>{listing.isbn}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#1e293b' }}>
                Description
              </h3>
              <p style={{ whiteSpace: 'pre-line', color: '#475569', lineHeight: 1.7, fontSize: '0.975rem' }}>
                {listing.description}
              </p>
            </div>

            {/* Listing Meta Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Calendar size={18} color="#64748b" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Listed On</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{formatDate(listing.createdAt)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={18} color="#64748b" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pickup Spot</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{listing.pickupLocation || 'Campus Quad'}</div>
                </div>
              </div>
            </div>

            {/* Seller Profile Box */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  Seller Information
                </h4>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#09090b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                    Seller ID: #{listing.sellerId}
                  </span>
                  <span style={{ backgroundColor: '#f4f4f5', color: '#3f3f46', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                    User ID: #{listing.sellerUserId || listing.sellerId}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#f4f4f5',
                    color: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    border: '1px solid #e4e4e7',
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#09090b' }}>{listing.sellerName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{listing.sellerCampus || 'Campus Student'}</div>
                </div>
              </div>

              <div style={{ margin: '0.5rem 0 0.75rem 0', padding: '0.4rem 0.65rem', backgroundColor: '#f4f4f5', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '0.775rem', color: '#3f3f46', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="#09090b" />
                <span>Verified Campus Student Account</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={15} color="#64748b" /> {listing.sellerEmail}
                </div>
                {listing.sellerPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={15} color="#64748b" /> {listing.sellerPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Interaction or Owner Action Bar */}
            {isOwner ? (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#0f172a' }}>
                  Verified Seller Controls (You own this listing)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem' }}>
                  Authenticated as Seller ID #{listing.sellerId} (Linked User ID #{user?.id}). Only you have permission to edit, delete, or mark this listing as sold.
                </div>

                {/* Buyer Chats Direct Link for Seller */}
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: listing.inquiryCount > 0 ? '#f4f4f5' : '#fafafa',
                    borderRadius: '10px',
                    border: `1px solid ${listing.inquiryCount > 0 ? '#18181b' : '#e4e4e7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} color="#09090b" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09090b' }}>
                      {listing.inquiryCount > 0
                        ? `${listing.inquiryCount} Buyer ${listing.inquiryCount === 1 ? 'Inquiry' : 'Inquiries'} Received`
                        : '0 Buyer Inquiries Yet'}
                    </span>
                  </div>
                  <Link
                    to={`/messages?listingId=${listing.id}`}
                    className="btn btn-sm btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                  >
                    <MessageSquare size={14} />
                    {listing.inquiryCount > 0 ? `Answer Buyer Chats (${listing.inquiryCount})` : 'Open Messages'}
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {!isSold && (
                    <button
                      type="button"
                      onClick={handleMarkAsSold}
                      disabled={actionLoading}
                      className="btn btn-success"
                    >
                      <CheckCircle size={16} /> Mark as Sold
                    </button>
                  )}
                  <Link to={`/listings/${listing.id}/edit`} className="btn btn-outline">
                    <Edit size={16} /> Edit Listing
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {isSold ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      This item has been marked as SOLD
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                      The seller has concluded the exchange. Inquiries are disabled.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="btn btn-lg btn-primary"
                      style={{
                        width: '100%',
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        fontWeight: 700,
                      }}
                    >
                      <MessageSquare size={20} /> Chat with Seller / Send Inquiry
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleWishlist}
                      disabled={savingWishlist}
                      className="btn btn-lg btn-outline"
                      style={{
                        width: '100%',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        borderColor: saved ? '#09090b' : '#e4e4e7',
                        color: saved ? '#ffffff' : '#09090b',
                        backgroundColor: saved ? '#09090b' : '#ffffff',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Heart
                        size={19}
                        fill={saved ? '#ffffff' : 'none'}
                        color={saved ? '#ffffff' : '#09090b'}
                      />
                      {saved ? 'Saved to Your Wishlist (Click to remove)' : 'Save to Wishlist'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Seller Modal */}
      <ContactSellerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        listing={listing}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Confirm Deletion
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#334155', lineHeight: 1.6 }}>
                Are you sure you want to permanently delete <strong>{listing.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                className="btn btn-danger"
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
