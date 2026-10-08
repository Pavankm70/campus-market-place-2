import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { listingService } from '../services/listingService';
import { formatDate } from '../utils/formatters';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [campusName, setCampusName] = useState(user?.campusName || 'Main Campus');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 });

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setCampusName(user.campusName || 'Main Campus');
    }

    // Load user listings stats
    const fetchStats = async () => {
      try {
        const myListings = await listingService.getMyListings();
        const total = myListings.length;
        const available = myListings.filter((l) => l.status === 'AVAILABLE').length;
        const sold = myListings.filter((l) => l.status === 'SOLD').length;
        setStats({ total, available, sold });
      } catch (err) {
        console.warn('Could not load profile stats:', err);
      }
    };

    fetchStats();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (phone.trim() && cleanPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits (e.g. 9876543210)');
      return;
    }

    setSaving(true);

    try {
      const updated = await authService.updateProfile({ phone: cleanPhone, campusName: campusName.trim() });
      updateUser(updated);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Student Profile
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Manage your campus contact details and view your seller activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#09090b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Package size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#09090b' }}>{stats.total}</div>
            <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 600 }}>Total Listings</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#27272a', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <Sparkles size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#09090b' }}>{stats.available}</div>
            <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 600 }}>Active Listings</div>
          </div>

          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#71717a', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCheck size={28} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#09090b' }}>{stats.sold}</div>
            <div style={{ fontSize: '0.85rem', color: '#71717a', fontWeight: 600 }}>Sold Exchanges</div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {successMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Details Reference */}
          <div
            style={{
              backgroundColor: '#f4f4f5',
              border: '1px solid #e4e4e7',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Account Details
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: '#09090b' }}>
                  Student Member Profile
                </h3>
              </div>
              <span className="badge" style={{ backgroundColor: '#09090b', color: '#ffffff', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                <CheckCircle2 size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Verified Member
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'white', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>USER ID</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>#{user?.id || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>● Buyer Identity</div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>SELLER ID (Linked to User ID)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b' }}>#{user?.sellerId || user?.id || '—'}</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>● Seller Identity (Auto-Linked)</div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.825rem', color: '#71717a', lineHeight: 1.5 }}>
              Your account allows you to browse, purchase, and list items for sale. Listings you create are automatically linked to your Seller ID (#{user?.sellerId || user?.id}).
            </p>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Full Name (Readonly) */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="form-input"
                    style={{ paddingLeft: '38px', backgroundColor: '#f8fafc', color: '#475569' }}
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="form-input"
                    style={{ paddingLeft: '38px', backgroundColor: '#f8fafc', color: '#475569' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number (10 Digits)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
                <div className="form-hint">10-digit mobile number displayed to students inquiring about your listings</div>
              </div>

              {/* Campus Location */}
              <div className="form-group">
                <label className="form-label">Campus Quad / Residence Area</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={campusName}
                    onChange={(e) => setCampusName(e.target.value)}
                    placeholder="e.g. North Campus, Engineering Quad, West Dorms"
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
                <div className="form-hint">Helps buyers see which part of campus you are based at</div>
              </div>
            </div>

            {/* Account Info */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.85rem',
                color: '#64748b',
                marginBottom: '2rem',
              }}
            >
              <Calendar size={16} />
              <span>Student member since: {formatDate(user?.createdAt)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/my-listings" className="btn btn-outline">
                <Package size={16} /> Manage My Listings
              </Link>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save size={16} /> Save Changes
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

export default ProfilePage;
