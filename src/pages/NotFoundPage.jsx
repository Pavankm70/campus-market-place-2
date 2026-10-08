import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem',
        minHeight: '75vh',
        textAlign: 'center',
        backgroundColor: '#fcfcfc',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            fontSize: '6.5rem',
            fontWeight: 900,
            color: '#e4e4e7',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: '#09090b', letterSpacing: '-0.02em' }}>
          Page Not Found
        </h1>
        <p style={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or marketplace listing you are looking for does not exist, has been removed, or moved to another link.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-outline">
            <Home size={16} /> Home
          </Link>
          <Link to="/browse" className="btn btn-primary">
            <Compass size={16} /> Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
