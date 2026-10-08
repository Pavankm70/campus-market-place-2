import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search textbooks, electronics, calculators, lab supplies...' }) => {
  const [term, setTerm] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  const handleClear = () => {
    setTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={20}
          color="#71717a"
          style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className="form-input"
          style={{
            paddingLeft: '48px',
            paddingRight: term ? '96px' : '48px',
            paddingTop: '0.85rem',
            paddingBottom: '0.85rem',
            borderRadius: '9999px',
            fontSize: '0.975rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            backgroundColor: '#ffffff',
            borderColor: '#e4e4e7',
          }}
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '60px',
              background: 'none',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          style={{
            position: 'absolute',
            right: '8px',
            borderRadius: '9999px',
            padding: '0.5rem 1.15rem',
            fontSize: '0.85rem',
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
