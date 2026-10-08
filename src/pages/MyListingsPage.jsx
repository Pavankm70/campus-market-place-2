import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { formatPrice, formatDate } from '../utils/formatters';
import { DEFAULT_PLACEHOLDER_IMAGE, getCategoryPlaceholder, sanitizeImageUrl } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  ExternalLink,
  Calendar,
  Tag,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyListingsPage = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, AVAILABLE, SOLD
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMyListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getMyListings();
      setListings(data || []);
    } catch (err) {
      console.error('Failed to load my listings:', err);
      setError('Unable to fetch your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  // Mark as Sold with immediate state update
  const handleMarkAsSold = async (id) => {
    setActionLoadingId(id);
    try {
      const updated = await listingService.markAsSold(id);
      // Immediately reflect state without page reload
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'SOLD' } : item))
      );
    } catch (err) {
      console.error('Failed to mark listing as sold:', err);
      alert(err.response?.data?.message || 'Failed to mark as sold. Only the owner can mark it sold.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete listing with immediate state update
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setActionLoadingId(deleteTarget.id);
    try {
      await listingService.deleteListing(deleteTarget.id);
      // Immediately remove from UI
      setListings((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing. Only the owner has permission.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (filterTab === 'AVAILABLE') return item.status === 'AVAILABLE';
    if (filterTab === 'SOLD') return item.status === 'SOLD';
    return true;
  });

  const availableCount = listings.filter((l) => l.status === 'AVAILABLE').length;
  const soldCount = listings.filter((l) => l.status === 'SOLD').length;

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#09090b', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                Seller ID: #{user?.sellerId || user?.id || '—'}
              </span>
              <span style={{ backgroundColor: '#f4f4f5', color: '#3f3f46', fontWeight: 600, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                Linked User ID: #{user?.id || '—'}
              </span>
              <span style={{ backgroundColor: '#f4f4f5', color: '#09090b', fontWeight: 600, fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                Verified Seller &amp; Buyer
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              My Listings Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              Items published under your Seller ID. Only you have permission to edit, delete, or mark these listings as sold.
            </p>
          </div>
          <Link to="/sell" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Post New Listing
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`btn btn-sm ${filterTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Items ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('AVAILABLE')}
            className={`btn btn-sm ${filterTab === 'AVAILABLE' ? 'btn-primary' : 'btn-outline'}`}
          >
            Active &amp; Available ({availableCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('SOLD')}
            className={`btn btn-sm ${filterTab === 'SOLD' ? 'btn-primary' : 'btn-outline'}`}
          >
            Sold Archive ({soldCount})
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner message="Fetching your listings..." />
        ) : error ? (
          <EmptyState
            title="Failed to Load"
            message={error}
            actionText="Try Again"
            onAction={fetchMyListings}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="You don't have any listings yet"
            message="Ready to sell textbooks, electronics, or lab supplies? Create your first listing and start connecting with buyers on campus!"
            actionText="Create Listing"
            actionLink="/sell"
          />
        ) : filteredListings.length === 0 ? (
          <EmptyState
            title={`No ${filterTab.toLowerCase()} listings found`}
            message="No items match this status filter."
            actionText="Show All Items"
            onAction={() => setFilterTab('ALL')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredListings.map((item) => {
              const isSold = item.status === 'SOLD';
              const isActionLoading = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '1.5rem',
                    opacity: isSold ? 0.85 : 1,
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={sanitizeImageUrl(item.imageUrl) || getCategoryPlaceholder(item.category)}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f1f5f9',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      const placeholder = getCategoryPlaceholder(item.category);
                      if (e.target.src !== placeholder) {
                        e.target.src = placeholder;
                      }
                    }}
                  />

                  {/* Details */}
                  <div style={{ flexGrow: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-category">
                        <Tag size={12} /> {item.categoryDisplayName || item.category}
                      </span>
                      {isSold ? (
                        <span className="badge badge-sold">SOLD</span>
                      ) : (
                        <span className="badge badge-available">AVAILABLE</span>
                      )}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.785rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          backgroundColor: item.inquiryCount > 0 ? '#f4f4f5' : '#ffffff',
                          color: '#09090b',
                          border: '1px solid #e4e4e7',
                        }}
                      >
                        <MessageSquare size={13} />
                        {item.inquiryCount > 0
                          ? `${item.inquiryCount} Buyer ${item.inquiryCount === 1 ? 'Chat' : 'Chats'}`
                          : '0 Buyer Chats'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                        <Calendar size={13} /> {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: '#09090b' }}>
                      <Link to={`/listings/${item.id}`} style={{ color: 'inherit' }}>
                        {item.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/messages?listingId=${item.id}`}
                      className="btn btn-sm"
                      style={{
                        backgroundColor: item.inquiryCount > 0 ? '#09090b' : '#ffffff',
                        color: item.inquiryCount > 0 ? '#ffffff' : '#09090b',
                        border: '1px solid #09090b',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                      title="View and answer buyer inquiries for this item"
                    >
                      <MessageSquare size={14} />
                      {item.inquiryCount > 0 ? `Buyer Chats (${item.inquiryCount})` : 'Buyer Chats'}
                    </Link>

                    <Link
                      to={`/listings/${item.id}`}
                      className="btn btn-sm btn-outline"
                      title="View Public Page"
                    >
                      <ExternalLink size={15} /> View
                    </Link>

                    {!isSold ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsSold(item.id)}
                        disabled={isActionLoading}
                        className="btn btn-sm btn-success"
                        title="Mark item as SOLD"
                      >
                        <CheckCircle size={15} /> Mark Sold
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#475569',
                          padding: '0.4rem 0.75rem',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                        }}
                      >
                        Completed
                      </span>
                    )}

                    <Link
                      to={`/listings/${item.id}/edit`}
                      className="btn btn-sm btn-outline"
                      title="Edit Listing"
                    >
                      <Edit size={15} /> Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      disabled={isActionLoading}
                      className="btn btn-sm btn-danger"
                      title="Delete Listing"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Delete Listing
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#334155', lineHeight: 1.6 }}>
                Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong>? This item will be removed immediately from the marketplace.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="btn btn-outline"
                disabled={actionLoadingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                disabled={actionLoadingId !== null}
              >
                {actionLoadingId !== null ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;
