import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  GraduationCap,
  PlusCircle,
  Package,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Compass,
  Home,
  Heart,
  MessageSquare
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { savedCount } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e4e4e7',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
          onClick={closeMenu}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.2s ease',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              CAMPUS <span style={{ fontWeight: 400, color: '#71717a' }}>MARKETPLACE</span>
            </div>
            <div style={{ fontSize: '0.685rem', color: '#71717a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Student-to-Student Exchange
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }} className="desktop-nav">
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : '#3f3f46',
              backgroundColor: isActive ? '#09090b' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <Home size={16} /> Home
          </NavLink>

          <NavLink
            to="/browse"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? '#ffffff' : '#3f3f46',
              backgroundColor: isActive ? '#09090b' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <Compass size={16} /> Browse
          </NavLink>

          {isAuthenticated ? (
            <>
              {/* Wishlist Link with Count Badge */}
              <NavLink
                to="/wishlist"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#3f3f46',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Heart
                  size={16}
                  fill={savedCount > 0 ? (window.location.pathname === '/wishlist' ? '#ffffff' : '#09090b') : 'none'}
                  color="currentColor"
                />
                <span>Saved</span>
                {savedCount > 0 && (
                  <span
                    style={{
                      backgroundColor: window.location.pathname === '/wishlist' ? '#ffffff' : '#09090b',
                      color: window.location.pathname === '/wishlist' ? '#09090b' : '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      marginLeft: '2px',
                    }}
                  >
                    {savedCount}
                  </span>
                )}
              </NavLink>

              {/* Direct Messages & Chat */}
              <NavLink
                to="/messages"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#3f3f46',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <MessageSquare size={16} /> Messages
              </NavLink>

              {/* Sell an Item */}
              <NavLink
                to="/sell"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#3f3f46',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <PlusCircle size={16} /> Sell
              </NavLink>

              {/* My Listings */}
              <NavLink
                to="/my-listings"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#3f3f46',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <Package size={16} /> My Listings
              </NavLink>

              {/* Profile */}
              <NavLink
                to="/profile"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#3f3f46',
                  backgroundColor: isActive ? '#09090b' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                })}
              >
                <User size={16} /> Profile
              </NavLink>
            </>
          ) : null}
        </nav>

        {/* Desktop Auth Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.85rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#09090b' }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: '0.725rem', color: '#71717a', fontWeight: 600 }}>
                  Student #{user?.sellerId || user?.id}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-sm btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                title="Log out"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                <LogIn size={15} /> Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                <UserPlus size={15} /> Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'inline-flex',
            padding: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#09090b',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e4e4e7',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)',
          }}
          className="mobile-nav"
        >
          {isAuthenticated && (
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f4f4f5' }}>
              <div style={{ fontWeight: 700, color: '#09090b' }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{user?.email}</div>
            </div>
          )}

          <Link to="/" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Home size={18} /> Home
          </Link>
          <Link to="/browse" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Compass size={18} /> Browse Marketplace
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/wishlist" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Heart size={18} /> Saved Listings ({savedCount})
              </Link>
              <Link to="/messages" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <MessageSquare size={18} /> Messages &amp; Inquiries
              </Link>
              <Link to="/sell" onClick={closeMenu} className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                <PlusCircle size={18} /> Sell an Item
              </Link>
              <Link to="/my-listings" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Package size={18} /> My Listings
              </Link>
              <Link to="/profile" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <User size={18} /> Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', marginTop: '0.5rem', color: '#dc2626' }}
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={closeMenu} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                <LogIn size={18} /> Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <UserPlus size={18} /> Register Account
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
