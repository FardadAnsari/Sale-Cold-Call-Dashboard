import React, { useState, useMemo } from 'react';
import mockShopData from './mockData';
import Search from '@components/Search';
import Filter from '@components/Filter';
import Table from '@components/Table';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ postcode: '', city: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  //  unique postcodes and cities
  const uniquePostcodes = [...new Set(mockShopData.map(shop => shop.postcode).filter(Boolean))];
  const uniqueCities = [...new Set(mockShopData.map(shop => shop.city).filter(Boolean))];

  // Filter shops
  const filteredShops = useMemo(() => {
    return mockShopData.filter(shop => {
      const matchesSearch =
        !searchTerm.trim() ||
        shop.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        shop.phone.includes(searchTerm.trim()) ||
        shop.postcode.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesPostcode = !filters.postcode || shop.postcode === filters.postcode;
      const matchesCity = !filters.city || shop.city === filters.city;
      const matchesCategory = !selectedCategory || shop.serviceType === selectedCategory;
      return matchesSearch && matchesPostcode && matchesCity && matchesCategory;
    });
  }, [searchTerm, filters, selectedCategory]);

  const categories = ['Takeaway', 'Dine Restaurant', 'Café'];

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen text-white' : 'bg-gray-50 min-h-screen text-gray-900'}>
      <header className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">UK Shop Directory</h1>
          <p className="mt-2">Find local takeaways, restaurants, and cafés in U.K</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 flex justify-end">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
            <Filter
              filters={filters}
              setFilters={setFilters}
              uniquePostcodes={uniquePostcodes}
              uniqueCities={uniqueCities}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Categories</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-blue-600 text-white' 
                      : isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <Table shops={filteredShops} isDarkMode={isDarkMode} />
        </div>
      </main>
    </div>
  );
}

export default App;