import React from 'react';
import { CATEGORIES } from '../utils/constants';
import {
  Grid,
  BookOpen,
  Laptop,
  FlaskConical,
  PenTool,
  Armchair,
  Shirt,
  MoreHorizontal
} from 'lucide-react';

const categoryIcons = {
  ALL: Grid,
  BOOKS: BookOpen,
  ELECTRONICS: Laptop,
  LAB_SUPPLIES: FlaskConical,
  STATIONERY: PenTool,
  FURNITURE: Armchair,
  CLOTHING: Shirt,
  OTHER: MoreHorizontal,
};

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        overflowX: 'auto',
        padding: '0.5rem 0.25rem 1rem 0.25rem',
        scrollbarWidth: 'none',
      }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = categoryIcons[cat.value] || Grid;
        const isSelected = selectedCategory === cat.value;

        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onSelectCategory(cat.value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: '1.5px solid',
              borderColor: isSelected ? '#09090b' : '#e4e4e7',
              backgroundColor: isSelected ? '#09090b' : '#ffffff',
              color: isSelected ? '#ffffff' : '#3f3f46',
              boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
              transform: isSelected ? 'translateY(-1px)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Icon size={16} color={isSelected ? '#ffffff' : '#71717a'} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
