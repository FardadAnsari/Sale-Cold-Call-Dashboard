import React from 'react';

const Search = ({ searchTerm, setSearchTerm, isDarkMode }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="max-w-md w-full mx-auto md:mx-0">
      <div className="relative w-full">
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search by name, phone or postcode..."
          className={`w-full pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400'
              : 'bg-gray-100 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
          }`}
          style={{ outline: 'none', boxShadow: 'none' }}
        />
        <svg
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
