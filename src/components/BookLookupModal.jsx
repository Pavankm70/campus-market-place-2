import React, { useState } from 'react';
import { bookService } from '../services/bookService';
import { Search, X, Book, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BookLookupModal = ({ isOpen, onClose, onSelectBook }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await bookService.lookupBook(query);
      setResults(data || []);
    } catch (err) {
      console.error('Book lookup failed:', err);
      setError('External book lookup service is currently slow or unreachable. You can continue filling details manually.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = (book) => {
    onSelectBook(book);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <Book size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Find Book Metadata</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                Search by book title or 10/13-digit ISBN to auto-fill listing fields
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. Introduction to Algorithms or 9780262046305"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !query.trim()}
            >
              Search
            </button>
          </form>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#92400e',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && <LoadingSpinner message="Searching books database..." />}

          {/* Results List */}
          {!loading && searched && results.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>No matches found</p>
              <p style={{ fontSize: '0.875rem' }}>Check your spelling or ISBN digits, or enter your textbook information manually.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto' }}>
              {results.map((book, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    alignItems: 'center',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Thumbnail */}
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      style={{
                        width: '54px',
                        height: '75px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '54px',
                        height: '75px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      <Book size={24} />
                    </div>
                  )}

                  {/* Metadata */}
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '0.2rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {book.title}
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: '#475569', margin: '0 0 0.25rem 0' }}>
                      By: {book.author || 'Unknown'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      {book.isbn && <span>ISBN: {book.isbn}</span>}
                      {book.publisher && <span>• {book.publisher}</span>}
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={() => handleChoose(book)}
                    className="btn btn-sm btn-primary"
                    style={{ flexShrink: 0 }}
                  >
                    <Check size={14} /> Auto-fill
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookLookupModal;
