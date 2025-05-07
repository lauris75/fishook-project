import React from 'react';
import "./SearchFilter.scss";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const SearchFilter = ({ 
  searchQuery, 
  setSearchQuery, 
  filterOptions = null,
  selectedFilter = 'all',
  onFilterChange = null,
  placeholder = "Search..." 
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <SearchIcon className="icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="clear-btn" 
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </div>
      
      {filterOptions && onFilterChange && (
        <div className="filter-dropdown">
          <FilterListIcon className="icon" />
          <select 
            value={selectedFilter} 
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;