import React, { useState } from 'react';
import Table from './Table';
import Search from './Search';
import Pagination from './Pagination';
import ShopDetails from './ShopDetails';
import { RestaurantIcon, CafeIcon, FilterIcon } from 'src/Icons';
import takeawayImg from '../images/takeaway.png';
import mockShopData from '../mockData';

const SaleZone = ({ isDarkMode, toggleDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ city: '', postcode: '', category: '' });
  const [tempFilters, setTempFilters] = useState({ city: '', postcode: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniqueCities = [...new Set(mockShopData.map((shop) => shop.city))];
  const uniquePostcodes = [...new Set(mockShopData.map((shop) => shop.postcode))];
  const orderedCategories = ['Takeaway', 'Restaurant', 'Café'];

  const handleCategoryClick = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? '' : category,
    }));
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setTempFilters({
      ...tempFilters,
      city,
      postcode: '',
    });
  };

  const handlePostcodeChange = (e) => {
    const postcode = e.target.value;
    setTempFilters({
      ...tempFilters,
      postcode,
    });
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      city: tempFilters.city,
      postcode: tempFilters.postcode,
    }));
    setShowFilters(false);
  };

  const filteredShops = mockShopData.filter((shop) => {
    const matchesCity = filters.city ? shop.city === filters.city : true;
    const matchesPostcode = filters.postcode ? shop.postcode === filters.postcode : true;
    const matchesCategory = filters.category ? shop.serviceType === filters.category : true;
    const matchesSearch = searchTerm
      ? Object.values(shop).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;
    return matchesCity && matchesPostcode && matchesCategory && matchesSearch;
  });

  const handleRowClick = (shop) => {
    setSelectedShop(shop);
  };

  const handleClose = () => {
    setSelectedShop(null);
  };

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Takeaway':
        return <img src={takeawayImg} alt="Takeaway" className="w-10 h-10 bg-transparent rounded-full" />;
      case 'Restaurant':
        return <RestaurantIcon />;
      case 'Café':
        return <CafeIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen`}>
      <header className={`p-0 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto">
          <div className="flex">
            {orderedCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`flex-1 flex items-center justify-center gap-2 text-lg border-0 transition-colors text-center py-4 ${
                  filters.category === category
                    ? 'bg-blue-500 text-white'
                    : `${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`
                }`}
              >
                {getIconForCategory(category)}
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className={`container mx-auto p-4 space-y-6`}>
        <div className="flex justify-between items-center">
          <div className="max-w-md md:max-w-xl lg:max-w-2xl flex-grow">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="relative inline-block text-left">
              <button
                onClick={() => {
                  setTempFilters({
                    city: filters.city,
                    postcode: filters.postcode,
                  });
                  setShowFilters(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  isDarkMode
                    ? 'bg-dark-700 border text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <FilterIcon />
                <span>Filter</span>
              </button>
              {showFilters && (
                <>
                  <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    onClick={() => setShowFilters(false)}
                  ></div>
                  <div
                    className={`absolute right-4 mt-2 w-72 rounded-md shadow-lg z-50 ${
                      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                    }`}
                  >
                    <div className="p-4">
                      <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        Filters
                      </h3>
                      <div className="mb-4">
                        <label htmlFor="filter-city" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select a city
                        </label>
                        <select
                          id="filter-city"
                          value={tempFilters.city}
                          onChange={handleCityChange}
                          className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                          }`}
                        >
                          <option value="">All Cities</option>
                          {uniqueCities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="filter-postcode" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select a postcode
                          {tempFilters.city && <span className="text-xs ml-1 opacity-75">({tempFilters.city})</span>}
                        </label>
                        <select
                          id="filter-postcode"
                          value={tempFilters.postcode}
                          onChange={handlePostcodeChange}
                          disabled={!tempFilters.city}
                          className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                          }`}
                        >
                          <option value="">
                            {tempFilters.city
                              ? `All ${tempFilters.city} Postcodes`
                              : 'Select a city first'}
                          </option>
                          {tempFilters.city
                            ? mockShopData
                                .filter((shop) => shop.city === tempFilters.city)
                                .map((shop) => shop.postcode)
                                .filter((pc, i, self) => self.indexOf(pc) === i)
                                .map((postcode) => (
                                  <option key={postcode} value={postcode}>
                                    {postcode}
                                  </option>
                                ))
                            : uniquePostcodes.map((postcode) => (
                                <option key={postcode} value={postcode}>
                                  {postcode}
                                </option>
                              ))}
                        </select>
                        {!tempFilters.city && (
                          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Select a city to see postcodes
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={() => setShowFilters(false)}
                          className={`px-3 py-1.5 text-sm rounded transition-colors ${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          Close
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-sm rounded transition-colors whitespace-nowrap"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <Table shops={paginatedShops} isDarkMode={isDarkMode} onRowClick={handleRowClick} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isDarkMode={isDarkMode}
        />
      </main>
      {selectedShop && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div
            className={`relative rounded-lg shadow-xl overflow-auto max-w-5xl w-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{ maxHeight: '90vh' }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl font-bold z-10"
            >
              &times;
            </button>
            <ShopDetails
              shop={selectedShop}
              calls={[]}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleZone;
