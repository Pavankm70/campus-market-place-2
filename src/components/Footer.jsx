import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#09090b',
        color: '#a1a1aa',
        borderTop: '1px solid #27272a',
        marginTop: 'auto',
        padding: '4rem 0 2.25rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)',
                }}
              >
                <GraduationCap size={22} />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                CAMPUS MARKETPLACE
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#a1a1aa', marginBottom: '1.25rem' }}>
              A verified college student-to-student marketplace. Buy and sell textbooks, calculators, electronics, lab equipment, and campus dorm essentials safely.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#f4f4f5' }}>
              <ShieldCheck size={18} color="#ffffff" /> Verified college student community
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Explore Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/browse?category=BOOKS" style={{ color: '#a1a1aa', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#a1a1aa'}>
                  Textbooks &amp; Course Material
                </Link>
              </li>
              <li>
                <Link to="/browse?category=ELECTRONICS" style={{ color: '#a1a1aa', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#a1a1aa'}>
                  Electronics &amp; Calculators
                </Link>
              </li>
              <li>
                <Link to="/browse?category=LAB_SUPPLIES" style={{ color: '#a1a1aa', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#a1a1aa'}>
                  Lab Coats &amp; Science Kits
                </Link>
              </li>
              <li>
                <Link to="/browse?category=FURNITURE" style={{ color: '#a1a1aa', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#a1a1aa'}>
                  Dorm Furniture &amp; Chairs
                </Link>
              </li>
              <li>
                <Link to="/browse?category=STATIONERY" style={{ color: '#a1a1aa', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#a1a1aa'}>
                  Stationery &amp; Art Supplies
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety Tips */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Campus Safety Tips
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem', color: '#a1a1aa' }}>
              <li>• Meet at designated public campus spots (Library, Student Quad).</li>
              <li>• Verify edition, notes, and condition before completing payment.</li>
              <li>• Test electronic items and calculators in person.</li>
              <li>• Convenient handoffs between campus classes.</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #27272a',
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} Campus Marketplace. Built for university student success.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/browse" style={{ color: '#71717a' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#71717a'}>All Listings</Link>
            <Link to="/sell" style={{ color: '#71717a' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#71717a'}>List an Item</Link>
            <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')}/swagger-ui/index.html`} target="_blank" rel="noreferrer" style={{ color: '#71717a', display: 'inline-flex', alignItems: 'center', gap: '2px' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#71717a'}>API Docs <ArrowUpRight size={12} /></a>
            <a href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')}/api/health`} target="_blank" rel="noreferrer" style={{ color: '#71717a', display: 'inline-flex', alignItems: 'center', gap: '2px' }} onMouseEnter={e => e.target.style.color='#ffffff'} onMouseLeave={e => e.target.style.color='#71717a'}>Health <ArrowUpRight size={12} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
