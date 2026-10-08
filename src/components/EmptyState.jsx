import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  message = 'Try adjusting your search criteria or check back later.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '18px',
        border: '1.5px dashed #d4d4d8',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#f4f4f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#09090b',
          marginBottom: '1.25rem',
          border: '1px solid #e4e4e7',
        }}
      >
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#09090b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        {title}
      </h3>
      <p style={{ color: '#71717a', maxWidth: '420px', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        {message}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button type="button" onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
