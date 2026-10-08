import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { bookService } from '../services/bookService';
import BookLookupModal from '../components/BookLookupModal';
import {
  CATEGORIES,
  CONDITIONS,
  DEFAULT_PLACEHOLDER_IMAGE,
  getCategoryPlaceholder,
  sanitizeImageUrl,
  PRESET_IMAGES,
} from '../utils/constants';
import {
  PlusCircle,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Tag,
  MapPin,
  ShieldCheck,
  Search,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'BOOKS',
    imageUrl: '',
    conditionType: 'Good',
    isbn: '',
    author: '',
    pickupLocation: 'Campus Library / Student Union',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Image load & preview states
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  // Inline Google Books Search states
  const [bookQuery, setBookQuery] = useState('');
  const [searchingBook, setSearchingBook] = useState(false);
  const [bookResults, setBookResults] = useState([]);
  const [autofillSuccess, setAutofillSuccess] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim()) {
      errs.title = 'Product title is required';
    } else if (formData.title.trim().length > 150) {
      errs.title = 'Title must not exceed 150 characters';
    }

    if (!formData.description || !formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length > 3000) {
      errs.description = 'Description must not exceed 3000 characters';
    }

    if (!formData.price || formData.price.toString().trim() === '') {
      errs.price = 'Price is required (e.g. 450.00)';
    } else {
      const p = parseFloat(formData.price);
      if (isNaN(p) || p <= 0) {
        errs.price = 'Price must be greater than ₹0.00';
      }
    }

    if (!formData.category) {
      errs.category = 'Please select a category';
    }

    setErrors(errs);
    const isValid = Object.keys(errs).length === 0;

    if (!isValid) {
      const firstField = Object.keys(errs)[0];
      setServerError(`Please fill in required fields: ${errs[firstField]}`);
      const el = document.getElementById(firstField);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === 'imageUrl') {
      finalVal = sanitizeImageUrl(value);
      setImageLoadError(false);
      setImagePreviewUrl('');
    }
    setFormData((prev) => ({ ...prev, [name]: finalVal }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local object URL preview
    const previewObjUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewObjUrl);
    setImageLoadError(false);

    setUploadingImage(true);
    setServerError(null);

    try {
      const url = await listingService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.warn('Backend image upload failed, falling back to embedded Data URL:', err);
      // Fallback: Read as base64 Data URL so user's image is preserved even if upload server glitches
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Inline Google Books Search handler
  const handleInlineBookSearch = async (e, queryOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const q = (queryOverride !== undefined ? queryOverride : (bookQuery || formData.title || '')).trim();
    if (!q) {
      setServerError('Please enter a book name or ISBN to search Google Books.');
      return;
    }

    setSearchingBook(true);
    setServerError(null);
    setAutofillSuccess(null);

    try {
      const data = await bookService.lookupBook(q);
      setBookResults(data || []);
      if (!data || data.length === 0) {
        setServerError(`No books found on Google Books for "${q}". You can enter details manually or try another title/ISBN.`);
      }
    } catch (err) {
      console.error('Google Books search failed:', err);
      setServerError('Unable to connect to Google Books API. Please check network or enter details manually.');
      setBookResults([]);
    } finally {
      setSearchingBook(false);
    }
  };

  // Auto-fill selected book from Google Books into listing form
  const handleSelectBook = (book) => {
    const bookCover = book.coverImageUrl ? sanitizeImageUrl(book.coverImageUrl) : '';
    setImageLoadError(false);
    setImagePreviewUrl('');

    setFormData((prev) => ({
      ...prev,
      title: book.title || prev.title,
      author: book.author || prev.author,
      isbn: book.isbn || prev.isbn,
      description: book.description ? `${book.description.substring(0, 1000)}` : (prev.description || `Textbook: ${book.title} by ${book.author || 'Author'}`),
      imageUrl: bookCover || prev.imageUrl,
      category: 'BOOKS',
    }));

    // Clear related field errors
    setErrors((prev) => ({
      ...prev,
      title: null,
      description: null,
      category: null,
    }));
    setServerError(null);
    setAutofillSuccess(`Auto-filled: "${book.title}" by ${book.author || 'Author'}. Now simply enter your asking price below and click Save!`);
    setBookResults([]); // close search dropdown

    // Smoothly scroll down to Price field
    setTimeout(() => {
      const priceEl = document.getElementById('price');
      if (priceEl) {
        priceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        priceEl.focus();
      }
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl?.trim() || undefined,
        conditionType: formData.conditionType || 'Good',
        isbn: formData.isbn?.trim() || undefined,
        author: formData.author?.trim() || undefined,
        pickupLocation: formData.pickupLocation?.trim() || undefined,
      };

      const created = await listingService.createListing(payload);
      navigate(`/listings/${created.id}`);
    } catch (err) {
      console.error('Failed to create listing:', err);
      if (err.response?.status === 401) {
        setServerError('Your session has expired. Please log in again to publish.');
      } else if (err.response?.data?.validationErrors) {
        setErrors(err.response.data.validationErrors);
        setServerError('Please fix the validation errors below.');
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else if (!err.response) {
        setServerError('Cannot reach backend server. Please check your network connection.');
      } else {
        setServerError('Failed to create listing. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#09090b', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
              Publishing as Seller ID: #{user?.sellerId || user?.id || '—'}
            </span>
            <span style={{ backgroundColor: '#f4f4f5', color: '#3f3f46', fontWeight: 600, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
              Linked User ID: #{user?.id || '—'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Sell an Item
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            List your textbook, electronics, supplies, or dorm essentials. Only your authenticated Seller account will have permission to edit or delete this listing.
          </p>
        </div>

        {/* Google Books Search & Auto-Fill Feature */}
        <div
          style={{
            backgroundColor: '#f4f4f5',
            border: '1.5px solid #e4e4e7',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#09090b',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Google Books Instant Auto-Fill
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#71717a', margin: 0 }}>
                  Type a book name or ISBN to automatically import title, author, description, and cover image from Google!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBookModalOpen(true)}
              className="btn btn-outline btn-sm"
            >
              <Sparkles size={14} /> Full Search Dialog
            </button>
          </div>

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => handleInlineBookSearch(e, bookQuery)}
            style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}
          >
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search
                size={18}
                color="#71717a"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                placeholder="Type book name (e.g. Clean Code, Introduction to Algorithms, Calculus)..."
                className="form-input"
                style={{
                  paddingLeft: '38px',
                  borderColor: '#e4e4e7',
                  backgroundColor: 'white',
                  fontSize: '0.95rem',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={searchingBook || !bookQuery.trim()}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                fontWeight: 600,
              }}
            >
              {searchingBook ? (
                <>
                  <Loader2 size={16} className="spin" /> Searching Google...
                </>
              ) : (
                <>
                  <Search size={16} /> Search Book
                </>
              )}
            </button>
          </form>

          {/* Auto-fill Success Alert */}
          {autofillSuccess && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
                <span>{autofillSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setAutofillSuccess(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Search Results Panel */}
          {bookResults.length > 0 && (
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #c7d2fe',
                padding: '1rem',
                maxHeight: '440px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>
                  Found {bookResults.length} book{bookResults.length > 1 ? 's' : ''} on Google Books:
                </span>
                <button
                  type="button"
                  onClick={() => setBookResults([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Close Results ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {bookResults.map((b, idx) => (
                  <div
                    key={b.isbn || idx}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <img
                      src={b.coverImageUrl || getCategoryPlaceholder('BOOKS')}
                      alt={b.title}
                      referrerPolicy="no-referrer"
                      style={{
                        width: '56px',
                        height: '76px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                      }}
                      onError={(e) => { e.target.src = getCategoryPlaceholder('BOOKS'); }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {b.title}
                      </h4>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.825rem', color: '#475569' }}>
                        By <span style={{ fontWeight: 600 }}>{b.author || 'Unknown Author'}</span>
                        {b.publishedDate ? ` • ${b.publishedDate}` : ''}
                      </p>
                      {b.isbn && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                          ISBN: {b.isbn}
                        </p>
                      )}
                      {b.description && (
                        <p
                          style={{
                            margin: '0.35rem 0 0 0',
                            fontSize: '0.775rem',
                            color: '#64748b',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {b.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectBook(b)}
                      className="btn btn-primary btn-sm"
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={14} /> Auto-fill this Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {serverError && (
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
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="req">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'has-error' : ''}`}
                required
              >
                {CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>

            {/* Product Title */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                <label className="form-label" htmlFor="title" style={{ margin: 0 }}>
                  Product Title <span className="req">*</span>
                </label>
                {formData.title.trim().length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      setBookQuery(formData.title);
                      handleInlineBookSearch(e, formData.title);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#09090b',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Search size={13} /> Search Google Books for "{formData.title.substring(0, 24)}..."
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Clean Code, Introduction to Algorithms, or Physics Volume 1"
                  className={`form-input ${errors.title ? 'has-error' : ''}`}
                  maxLength={150}
                  required
                />
                <button
                  type="button"
                  onClick={(e) => {
                    setBookQuery(formData.title);
                    handleInlineBookSearch(e, formData.title);
                  }}
                  disabled={searchingBook || !formData.title.trim()}
                  className="btn btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    borderColor: '#cbd5e1',
                  }}
                  title="Search Google Books for this title"
                >
                  {searchingBook ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                  <span>Lookup</span>
                </button>
              </div>
              {errors.title && <div className="form-error">{errors.title}</div>}
              <div className="form-hint">{formData.title.length}/150 characters</div>
            </div>

            {/* Price & Condition */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Price (₹ INR) <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee
                    size={18}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="450.00"
                    className={`form-input ${errors.price ? 'has-error' : ''}`}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="conditionType">
                  Item Condition
                </label>
                <select
                  id="conditionType"
                  name="conditionType"
                  value={formData.conditionType}
                  onChange={handleChange}
                  className="form-select"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Textbook extra fields if category is BOOKS */}
            {formData.category === 'BOOKS' && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#09090b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={16} color="#09090b" /> Textbook Extra Information (Optional)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="author">
                      Author(s)
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="e.g. Thomas H. Cormen"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="isbn">
                      ISBN
                    </label>
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder="e.g. 9780262046305"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description <span className="req">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe condition, edition, markings, included accessories, why you are selling..."
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                maxLength={3000}
                required
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
              <div className="form-hint">{formData.description.length}/3000 characters</div>
            </div>

            {/* Image URL & File Upload */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label className="form-label" htmlFor="imageUrl" style={{ margin: 0 }}>
                  Product Image (Paste Image Link or Upload File)
                </label>
                {(formData.imageUrl || imagePreviewUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageUrl: '' }));
                      setImagePreviewUrl('');
                      setImageLoadError(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Clear Image
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <ImageIcon
                    size={18}
                    color="#94a3b8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Paste image link (e.g. https://... or Google image URL)"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>

                {/* Upload File Input */}
                <label
                  className="btn btn-outline"
                  style={{
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    borderColor: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Upload size={16} /> {uploadingImage ? 'Uploading...' : 'Upload from Device'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="form-hint" style={{ marginBottom: '0.75rem' }}>
                Paste any web image URL (Google Books, Amazon, web image) or click <strong>Upload from Device</strong> to select a photo from your computer/phone.
              </div>

              {/* Quick Preset Category Covers */}
              <div style={{ marginBottom: '0.85rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>
                  Or click to use a verified campus category photo:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: preset.url }));
                        setImagePreviewUrl('');
                        setImageLoadError(false);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: formData.imageUrl === preset.url ? '1.5px solid #09090b' : '1px solid #e4e4e7',
                        backgroundColor: formData.imageUrl === preset.url ? '#09090b' : '#ffffff',
                        color: formData.imageUrl === preset.url ? '#ffffff' : '#3f3f46',
                        cursor: 'pointer',
                        fontWeight: formData.imageUrl === preset.url ? 700 : 500,
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Image Preview & Verification Status */}
              {(imagePreviewUrl || formData.imageUrl) && (
                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: imageLoadError ? '1px solid #fecaca' : '1px solid #bbf7d0',
                    backgroundColor: imageLoadError ? '#fef2f2' : '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <img
                    src={imagePreviewUrl || sanitizeImageUrl(formData.imageUrl)}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    style={{
                      width: '76px',
                      height: '76px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      flexShrink: 0,
                    }}
                    onLoad={() => setImageLoadError(false)}
                    onError={() => setImageLoadError(true)}
                  />
                  <div>
                    {!imageLoadError ? (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={16} color="#16a34a" /> Image loaded and verified
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                          This image will display properly across browse cards and detail views.
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <AlertCircle size={16} color="#dc2626" /> Unable to load this image URL
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '2px' }}>
                          External website blocked hotlinking. Please click <strong>Upload from Device</strong> to pick your file directly, or select a category cover above.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="pickupLocation">
                Preferred Campus Pickup Spot
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g. Student Union, Library 1st Floor, CS Building"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
              <div className="form-hint">Where you feel comfortable handing off the item to the buyer</div>
            </div>

            {/* Error Message above Submit Buttons */}
            {serverError && (
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
                  marginTop: '1.5rem',
                }}
              >
                <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600 }}>{serverError}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/browse" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || uploadingImage}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" /> Saving to Database...
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} /> Save & Publish Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Book Metadata Lookup Modal (Mandatory External API integration) */}
      <BookLookupModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSelectBook={handleSelectBook}
      />
    </div>
  );
};

export default CreateListingPage;
