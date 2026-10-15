import React from 'react';
import { Search, Filter, X, Calendar, CheckCircle2 } from 'lucide-react';
import { departmentsData } from '../data/departmentsData';

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  onlyAvailableToday,
  setOnlyAvailableToday,
  totalResults
}) {
  const specialties = ['All', ...departmentsData.map((d) => d.name)];

  return (
    <div className="filter-bar-container">
      <div className="search-row">
        {/* Search Input */}
        <div className="input-with-icon">
          <Search size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Search doctor by name, qualification, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                color: 'var(--gray-400)',
                padding: '4px'
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Department Selector */}
        <div className="input-with-icon">
          <Filter size={18} className="input-icon" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            {specialties.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Specialties' : dept}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.88rem', 
              fontWeight: 600,
              color: onlyAvailableToday ? 'var(--primary)' : 'var(--gray-600)',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: onlyAvailableToday ? 'var(--primary-light)' : 'var(--gray-100)',
              border: `1px solid ${onlyAvailableToday ? 'var(--primary)' : 'var(--gray-200)'}`,
              width: '100%',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
          >
            <input
              type="checkbox"
              checked={onlyAvailableToday}
              onChange={(e) => setOnlyAvailableToday(e.target.checked)}
              style={{ display: 'none' }}
            />
            <Calendar size={16} />
            <span>Available Today Only</span>
          </label>
        </div>
      </div>

      {/* Specialty Filter Chips & Results Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div className="specialty-chips-wrapper">
          {specialties.slice(0, 7).map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`filter-chip ${selectedDepartment === dept ? 'active' : ''}`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>
          Showing <span style={{ color: 'var(--dark-900)', fontWeight: 700 }}>{totalResults}</span> doctors
        </div>
      </div>
    </div>
  );
}
