import React, { useState } from 'react';
import { listingService } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Mail, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ContactSellerModal = ({ isOpen, onClose, listing }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState('Hi! I am interested in your listing. Is it still available to meet on campus?');
  const [contactInfo, setContactInfo] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdInquiryId, setCreatedInquiryId] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const resp = await listingService.sendInquiry(listing.id, {
        message: message.trim(),
        contactInfo: contactInfo.trim(),
      });
      if (resp?.id) {
        setCreatedInquiryId(resp.id);
      }
      setSuccess(true);
    } catch (err) {
      console.error('Failed to send inquiry:', err);
      const msg = err.response?.data?.message || 'Failed to send inquiry. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setCreatedInquiryId(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, letterSpacing: '-0.01em' }}>Contact Seller</h3>
              <p style={{ fontSize: '0.8rem', color: '#71717a', margin: 0 }}>
                Regarding: {listing.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Seller Direct Info */}
          <div
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Seller Information
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{listing.sellerName}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                <Mail size={15} /> <span>{listing.sellerEmail}</span>
              </div>
              {listing.sellerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <Phone size={15} /> <span>{listing.sellerPhone}</span>
                </div>
              )}
              {listing.pickupLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                  <MapPin size={15} /> <span>Preferred meetup: {listing.pickupLocation}</span>
                </div>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                Please log in to your student account to send an inquiry directly to the seller.
              </p>
              <Link to="/login" className="btn btn-primary">
                Login to Inquire
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                Inquiry Sent Successfully!
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                The seller has received your message and contact info. They will reach out via email or phone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: '#b91c1c',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Your Message <span className="req">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask questions about item condition, edition, or meetup location..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Your Contact Info (Email or Phone) <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. your_email@campus.edu or 555-0123"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={handleClose} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !message.trim()}
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <Send size={15} /> Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {success && (
          <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} className="btn btn-outline">
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                navigate(createdInquiryId ? `/messages?inquiryId=${createdInquiryId}` : '/messages');
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
            >
              <MessageSquare size={16} /> Open Direct Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSellerModal;
