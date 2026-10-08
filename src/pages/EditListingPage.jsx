import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingService } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  CATEGORIES,
  CONDITIONS,
  DEFAULT_PLACEHOLDER_IMAGE,
  getCategoryPlaceholder,
  sanitizeImageUrl,
  PRESET_IMAGES,
} from '../utils/constants';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  IndianRupee,
  MapPin,
  BookOpen,
  X,
} from 'lucide-react';

const EditListingPage = () => {
  const { id } = useParams();
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
    pickupLocation: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [notOwner, setNotOwner] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const data = await listingService.getListingById(id);
        // Check owner authorization on client as well
        if (user && data.sellerId && user.id !== data.sellerId) {
          setNotOwner(true);
        }

        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          category: data.category || 'BOOKS',
          imageUrl: data.imageUrl || '',
          conditionType: data.conditionType || 'Good',
          isbn: data.isbn || '',
          author: data.author || '',
          pickupLocation: data.pickupLocation || '',
        });
      } catch (err) {
        console.error('Failed to load listing for editing:', err);
        setServerError('Listing not found or unable to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim()) {
      errs.title = 'Title is required';
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

    // Instant local preview
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
        conditionType: formData.conditionType,
        isbn: formData.isbn?.trim() || undefined,
        author: formData.author?.trim() || undefined,
        pickupLocation: formData.pickupLocation?.trim() || undefined,
      };

      await listingService.updateListing(id, payload);
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Failed to update listing:', err);
      if (err.response?.status === 403) {
        setServerError('Permission denied: You can only edit your own listings.');
      } else if (err.response?.status === 401) {
        setServerError('Session expired. Please log in again.');
      } else if (err.response?.data?.validationErrors) {
        setErrors(err.response.data.validationErrors);
        setServerError('Please fix the validation errors below.');
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else if (!err.response) {
        setServerError('Cannot reach backend server. Please check your network connection.');
      } else {
        setServerError('Failed to update listing.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading listing data..." />;
  }

  if (notOwner) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <EmptyState
          title="Access Denied"
          message="You are not authorized to edit this listing because you are not the owner. The backend will reject any modifications."
          actionText="Back to Marketplace"
          actionLink="/browse"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={`/listings/${id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#09090b',
              fontWeight: 600,
              fontSize: '0.925rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Listing
          </Link>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#09090b', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
              Verified Seller ID: #{user?.sellerId || user?.id || '—'}
            </span>
            <span style={{ backgroundColor: '#f4f4f5', color: '#3f3f46', fontWeight: 600, fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
              Linked User ID: #{user?.id || '—'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Edit Listing #{id}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Only you as the authenticated seller (User ID #{user?.id}) have permission to update or delete this listing.
          </p>
        </div>

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
                className="form-select"
                required
              >
                {CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Product Title <span className="req">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'has-error' : ''}`}
                maxLength={150}
                required
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
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
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                maxLength={3000}
                required
              />
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>

            {/* Image URL & Upload */}
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
                Paste any image link or click <strong>Upload from Device</strong> to select a photo from your computer/phone.
              </div>

              {/* Quick Preset Category Covers */}
              <div style={{ marginBottom: '0.85rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem' }}>
                  Or click to apply a verified campus category photo:
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
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
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

            {/* Submit & Cancel */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to={`/listings/${id}`} className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting || uploadingImage}
              >
                {submitting ? 'Saving Changes...' : (
                  <>
                    <Save size={18} /> Update Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListingPage;
