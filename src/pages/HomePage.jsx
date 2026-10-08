import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingService } from '../services/listingService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import {
  ArrowRight,
  BookOpen,
  Laptop,
  FlaskConical,
  Armchair,
  PenTool,
  Shirt,
  MoreHorizontal,
  UserCheck,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

const categories = [
  { name: 'Books', key: 'BOOKS', icon: BookOpen, count: 'Textbooks & Study Guides' },
  { name: 'Electronics', key: 'ELECTRONICS', icon: Laptop, count: 'Calculators & Tech' },
  { name: 'Lab Supplies', key: 'LAB_SUPPLIES', icon: FlaskConical, count: 'Coats & Science Kits' },
  { name: 'Furniture', key: 'FURNITURE', icon: Armchair, count: 'Dorm Desks & Chairs' },
  { name: 'Stationery', key: 'STATIONERY', icon: PenTool, count: 'Notebooks & Pens' },
  { name: 'Clothing', key: 'CLOTHING', icon: Shirt, count: 'Varsity & Merch' },
  { name: 'Other', key: 'OTHER', icon: MoreHorizontal, count: 'Campus Essentials' },
];

const HomePage = () => {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await listingService.getFeaturedListings();
        setFeaturedListings(data || []);
      } catch (err) {
        console.error('Failed to load featured listings:', err);
        setError('Unable to load latest listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleHeroSearch = (query) => {
    if (query) {
      navigate(`/browse?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div>
      {/* High-End Monochromatic Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 119, 198, 0.15), rgba(255, 255, 255, 0)), linear-gradient(180deg, #09090b 0%, #111113 45%, #18181b 100%)',
          color: 'white',
          padding: '5.5rem 0 5rem 0',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid #27272a',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '0.45rem 1.15rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Sparkles size={16} color="#ffffff" />
            <span>The Official Student Marketplace</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: '1.25rem',
              lineHeight: 1.1,
              maxWidth: '880px',
              margin: '0 auto 1.25rem auto',
            }}
          >
            Buy &amp; Sell Peer-to-Peer Within Your Campus
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#a1a1aa',
              maxWidth: '680px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            Safely buy and sell textbooks, electronics, calculators, lab supplies, and dorm essentials directly with verified students on campus.
          </p>

          {/* Quick Search */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <SearchBar onSearch={handleHeroSearch} placeholder="Search textbooks, TI-84, lab coats, gear..." />
          </div>

          {/* Hero CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/browse"
              className="btn btn-lg"
              style={{
                backgroundColor: '#ffffff',
                color: '#09090b',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.2)',
                border: '1px solid #ffffff',
              }}
            >
              Browse Marketplace <ArrowRight size={18} />
            </Link>
            <Link
              to="/sell"
              className="btn btn-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.25)',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <PlusCircle size={18} /> Sell an Item
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', letterSpacing: '-0.03em', color: '#09090b' }}>
              Explore Campus Categories
            </h2>
            <p style={{ color: '#71717a', fontSize: '1rem' }}>
              Find exactly what you need for this semester from students nearby
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.key}
                  to={`/browse?category=${cat.key}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '16px',
                    padding: '1.75rem 1rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = '#09090b';
                    e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(0,0,0,0.1)';
                    const iconBox = e.currentTarget.querySelector('.cat-icon-box');
                    if (iconBox) {
                      iconBox.style.backgroundColor = '#09090b';
                      iconBox.style.color = '#ffffff';
                      iconBox.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = '#e4e4e7';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                    const iconBox = e.currentTarget.querySelector('.cat-icon-box');
                    if (iconBox) {
                      iconBox.style.backgroundColor = '#f4f4f5';
                      iconBox.style.color = '#09090b';
                      iconBox.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div
                    className="cat-icon-box"
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '14px',
                      backgroundColor: '#f4f4f5',
                      color: '#09090b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      transition: 'all 0.25s ease',
                      border: '1px solid #e4e4e7',
                    }}
                  >
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b', marginBottom: '0.25rem' }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Latest Listings Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#fafafa', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#09090b', fontWeight: 700, fontSize: '0.825rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Zap size={16} /> FRESH ON CAMPUS
              </div>
              <h2 style={{ fontSize: '2.1rem', letterSpacing: '-0.03em', margin: 0, color: '#09090b' }}>
                Latest Listings
              </h2>
            </div>
            <Link to="/browse" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              View All Marketplace <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching campus listings..." />
          ) : error ? (
            <EmptyState title="Oops!" message={error} actionText="Try Again" onAction={() => window.location.reload()} />
          ) : featuredListings.length === 0 ? (
            <EmptyState
              title="No listings yet"
              message="Be the first student to post an item for sale on campus!"
              actionText="Post First Listing"
              actionLink="/sell"
            />
          ) : (
            <div className="grid-listings">
              {featuredListings.map((listing) => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ color: '#71717a', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SIMPLE &amp; SAFE
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.75rem', letterSpacing: '-0.03em', color: '#09090b' }}>
              How Campus Marketplace Works
            </h2>
            <p style={{ color: '#71717a', fontSize: '1.05rem', lineHeight: 1.5 }}>
              Skip high textbook prices and retail markups with verified peer-to-peer campus exchanges.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '18px',
                padding: '2.75rem 2rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#09090b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e4e4e7';
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 8px 18px -3px rgba(0,0,0,0.25)',
                }}
              >
                <UserCheck size={30} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                STEP 01
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#09090b' }}>Create An Account</h3>
              <p style={{ color: '#71717a', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Sign up in seconds with your student details. You get access to browse and post listings instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '18px',
                padding: '2.75rem 2rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#09090b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e4e4e7';
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 8px 18px -3px rgba(0,0,0,0.25)',
                }}
              >
                <PlusCircle size={30} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                STEP 02
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#09090b' }}>List Your Item</h3>
              <p style={{ color: '#71717a', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Snap a photo, set your price, and list. For textbooks, our Book Lookup auto-fills title, author, and book cover!
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '18px',
                padding: '2.75rem 2rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#09090b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = '#e4e4e7';
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  boxShadow: '0 8px 18px -3px rgba(0,0,0,0.25)',
                }}
              >
                <MessageSquare size={30} />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                STEP 03
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#09090b' }}>Connect With Students</h3>
              <p style={{ color: '#71717a', fontSize: '0.925rem', lineHeight: 1.6 }}>
                Meet safely at designated campus spots (Library or Student Quad) to exchange items and receive payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Banner */}
      <section
        style={{
          padding: '3.5rem 0',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #e4e4e7',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#09090b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.15rem', color: '#09090b', marginBottom: '0.2rem' }}>
                Built Exclusively For Campus Safety
              </h4>
              <p style={{ color: '#71717a', fontSize: '0.875rem', margin: 0 }}>
                No stranger shipping fees, no waiting. Convenient campus handoffs between lectures.
              </p>
            </div>
          </div>
          <Link to="/browse" className="btn btn-primary btn-lg">
            Explore All Items
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
