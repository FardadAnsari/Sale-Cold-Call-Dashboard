

import React from 'react';

const Search = ({ searchTerm, setSearchTerm, isDarkMode }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <label htmlFor="search" className={`block text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Search Shops</label>
      <div className="relative">
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search by name, phone or postcode..."
          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
              : 'border-gray-300 text-gray-900 focus:border-blue-500'
          }`}
        />
        <svg
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button onClick={handleClear} className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;