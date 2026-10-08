import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    campusName: 'Main Campus',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      errs.name = 'Name can only contain alphabetic letters and spaces';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!formData.email.trim().toLowerCase().endsWith('@nmit.ac.in')) {
      errs.email = 'Email must end with @nmit.ac.in (e.g. yourname@nmit.ac.in)';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@nmit\.ac\.in$/i;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please provide a valid @nmit.ac.in email address';
      }
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password does not match password';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits (e.g. 9876543210)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'phone') {
      val = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone.trim().replace(/\D/g, ''),
        campusName: formData.campusName.trim() || 'NMIT Main Campus',
      });
      navigate('/browse');
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response?.data?.validationErrors) {
        setErrors(err.response.data.validationErrors);
      } else if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else if (!err.response) {
        setServerError('Cannot reach backend server. Please check your network connection.');
      } else {
        setServerError('Registration failed. Please check inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '3.5rem 1rem 5rem 1rem',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fcfcfc',
      }}
    >
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              backgroundColor: '#09090b',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: '1.95rem', letterSpacing: '-0.03em', marginBottom: '0.4rem', color: '#09090b' }}>
            Create Student Account
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.925rem', marginBottom: '0.5rem' }}>
            Register with your student credentials to connect with peers
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2.25rem', boxShadow: '0 12px 30px -8px rgba(0,0,0,0.08)', borderRadius: '18px' }}>
          {serverError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                color: '#b91c1c',
                fontSize: '0.875rem',
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

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jordan Rivera"
                  className={`form-input ${errors.name ? 'has-error' : ''}`}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                College Email (@nmit.ac.in) <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#a1a1aa"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. yourname@nmit.ac.in"
                  className={`form-input ${errors.email ? 'has-error' : ''}`}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '4px' }}>
                Must be an official college email ending with @nmit.ac.in
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="#a1a1aa"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 chars"
                    className={`form-input ${errors.password ? 'has-error' : ''}`}
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    color="#a1a1aa"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
            </div>

            {/* Phone & Campus Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number (10 Digits) <span className="req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={18}
                    color="#a1a1aa"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className={`form-input ${errors.phone ? 'has-error' : ''}`}
                    style={{ paddingLeft: '42px' }}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#71717a', marginTop: '4px' }}>
                  Exactly 10 digits
                </div>
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="campusName">
                  Campus / Block
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={18}
                    color="#a1a1aa"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    id="campusName"
                    name="campusName"
                    value={formData.campusName}
                    onChange={handleChange}
                    placeholder="e.g. Main Campus, EEE Block"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.9rem', fontSize: '1rem' }}
              disabled={submitting}
            >
              {submitting ? 'Registering Account...' : (
                <>
                  <UserPlus size={18} /> Complete Registration
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#71717a' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
