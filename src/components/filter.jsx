import React from 'react';
import mockShopData from 'src/mockData';
const Filter = ({ filters, setFilters, uniquePostcodes, uniqueCities, isDarkMode }) => {
  const handleCityChange = (e) => {
    const city = e.target.value;
    setFilters({
      ...filters,
      city,
      postcode: '' 
    });
  };

  const handlePostcodeChange = (e) => {
    const postcode = e.target.value;
    setFilters({
      ...filters,
      postcode
    });
  };

  const clearFilters = () => {
    setFilters({ city: '', postcode: '' });
  };

  // Filter postcodes based on selected city
  const postcodesForSelectedCity = filters.city
    ? mockShopData
        .filter(shop => shop.city === filters.city)
        .map(shop => shop.postcode)
        .filter((postcode, index, self) => self.indexOf(postcode) === index)
    : uniquePostcodes;

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Filter Shops</h3>
        {(filters.city || filters.postcode) && (
          <button onClick={clearFilters} className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Filter */}
        <div>
          <label htmlFor="city" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by City</label>
          <select
            id="city"
            value={filters.city}
            onChange={handleCityChange}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                : 'border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          >
            <option value="">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Postcode Filter */}
        <div>
          <label htmlFor="postcode" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Postcode
            {filters.city && (
              <span className="text-xs ml-1 opacity-75">({filters.city} postcodes)</span>
            )}
          </label>
          <select
            id="postcode"
            value={filters.postcode}
            onChange={handlePostcodeChange}
            disabled={!filters.city}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                : 'border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          >
            <option value="">
              {filters.city ? `All ${filters.city} Postcodes` : 'All Postcodes'}
            </option>
            {postcodesForSelectedCity.map(postcode => (
              <option key={postcode} value={postcode}>{postcode}</option>
            ))}
          </select>
          {!filters.city && (
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Select a city to see postcodes
            </p>
          )}
        </div>
      </div>

      {filters.city && postcodesForSelectedCity.length > 0 && (
        <div className={`mt-3 p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
            <span className="font-medium">{postcodesForSelectedCity.length}</span> postcode{postcodesForSelectedCity.length !== 1 ? 's' : ''} available in {filters.city}
          </p>
        </div>
      )}
    </div>
  );
};

export default Filter;