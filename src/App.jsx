import Feature from '@components/Feature';
import Footer from '@components/Footer';
import logo from '@images/logo.png';

import React, { useState, useMemo } from 'react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ postcode: '', city: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock shop data
  const mockShopData = [
    {
      id: 1,
      name: "Mario's Pizza Palace",
      serviceType: "Takeaway",
      phone: "020 7123 4567",
      postcode: "SW1A 1AA",
      city: "London",
      website: "www.mariospizza.co.uk",
      status: "Open"
    },
    {
      id: 2,
      name: "The Royal Café",
      serviceType: "Café",
      phone: "020 7234 5678",
      postcode: "SW1A 2BB",
      city: "London",
      website: "theroyalcafe.com",
      status: "Open"
    },
    {
      id: 3,
      name: "Dragon Palace Chinese",
      serviceType: "Dine Restaurant",
      phone: "020 7345 6789",
      postcode: "E1 6AN",
      city: "London",
      website: "dragonpalace.co.uk",
      status: "Closed"
    },
    {
      id: 4,
      name: "Bella Vista Restaurant",
      serviceType: "Dine Restaurant",
      phone: "020 7456 7890",
      postcode: "NW1 4NP",
      city: "London",
      website: "",
      status: "Open"
    },
    {
      id: 5,
      name: "Quick Bite Takeaway",
      serviceType: "Takeaway",
      phone: "020 7567 8901",
      postcode: "E1 7RT",
      city: "London",
      website: "quickbite.london",
      status: "Open"
    },
    {
      id: 6,
      name: "Coffee Corner",
      serviceType: "Café",
      phone: "020 7678 9012",
      postcode: "SW1H 9AJ",
      city: "London",
      website: "",
      status: "Open"
    },
    {
      id: 7,
      name: "Spice Garden",
      serviceType: "Takeaway",
      phone: "0161 234 5678",
      postcode: "M1 1AA",
      city: "Manchester",
      website: "spicegarden.co.uk",
      status: "Open"
    },
    {
      id: 8,
      name: "The Birmingham Bistro",
      serviceType: "Dine Restaurant",
      phone: "0121 345 6789",
      postcode: "B1 1BB",
      city: "Birmingham",
      website: "birminghambistro.com",
      status: "Closed"
    }
  ];

  // Extract unique postcodes and cities
  const uniquePostcodes = [...new Set(mockShopData.map(shop => shop.postcode).filter(Boolean))];
  const uniqueCities = [...new Set(mockShopData.map(shop => shop.city).filter(Boolean))];

  // Filter logic
  const filteredShops = useMemo(() => {
    return mockShopData.filter(shop => {
      const matchesSearch =
        !searchTerm ||
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.phone.includes(searchTerm) ||
        shop.postcode.includes(searchTerm);
      const matchesPostcode = !filters.postcode || shop.postcode === filters.postcode;
      const matchesCity = !filters.city || shop.city === filters.city;
      const matchesCategory = !selectedCategory || shop.serviceType === selectedCategory;
      return matchesSearch && matchesPostcode && matchesCity && matchesCategory;
    });
  }, [searchTerm, filters, selectedCategory]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ postcode: '', city: '' });
    setSelectedCategory('');
  };

  const hasActiveFilters = searchTerm || filters.postcode || filters.city || selectedCategory;

  // Component: Search
  const Search = ({ onSearchChange }) => {
    const [input, setInput] = useState('');
    const handleChange = (e) => {
      const value = e.target.value;
      setInput(value);
      onSearchChange(value);
    };
    const handleClear = () => {
      setInput('');
      onSearchChange('');
    };
    return (
      <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <label htmlFor="search" className={`block text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Search Shops</label>
        <div className="relative">
          <input
            id="search"
            type="text"
            value={input}
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
          {input && (
            <button onClick={handleClear} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} absolute right-3 top-1/2 transform -translate-y-1/2`}>
              &times;
            </button>
          )}
        </div>
      </div>
    );
  };

  // Component: Filter
  const Filter = ({ shops = [], onFilterChange, selectedPostcode = '', selectedCity = '' }) => {
    const [postcode, setPostcode] = useState(selectedPostcode || '');
    const [city, setCity] = useState(selectedCity || '');
    const updateFilter = (newPostcode, newCity) => {
      setPostcode(newPostcode);
      setCity(newCity);
      onFilterChange({ postcode: newPostcode, city: newCity });
    };
    const clearFilters = () => {
      setPostcode('');
      setCity('');
      onFilterChange({ postcode: '', city: '' });
    };
    return (
      <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Filter Shops</h3>
          {(postcode || city) && (
            <button onClick={clearFilters} className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Clear All</button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="postcode" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Postcode</label>
            <select
              id="postcode"
              value={postcode}
              onChange={(e) => updateFilter(e.target.value, city)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="">All Postcodes</option>
              {uniquePostcodes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="city" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by City</label>
            <select
              id="city"
              value={city}
              onChange={(e) => updateFilter(postcode, e.target.value)}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            >
              <option value="">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Component: Table
  const Table = ({ shops = [] }) => {
    if (!shops.length) {
      return (
        <div className={`p-6 rounded-lg shadow-sm border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
          <p>No shops found. Try adjusting your filters.</p>
        </div>
      );
    }

    const getStatusBadge = (status) => {
      const isOpen = status?.toLowerCase() === 'open';
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
          {status || 'Unknown'}
        </span>
      );
    };

    const formatWebsite = (url) => {
      if (!url) return null;
      const fullUrl = url.startsWith('http') ? url : `https://${url}`; 
      return (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
          Visit
        </a>
      );
    };

    return (
      <div className={`shadow-sm rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
          <h2 className="text-lg font-medium">Shop Directory</h2>
          <span className="text-sm">{shops.length} results</span>
        </div>
        <div className="overflow-x-auto md:block hidden">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Shop Name</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Service Type</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Phone</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Postcode</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Website</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {shops.map((shop) => (
                <tr key={shop.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{shop.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {shop.serviceType}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{shop.phone}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{shop.postcode}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatWebsite(shop.website)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(shop.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {shops.map((shop) => (
            <div key={shop.id} className={`px-6 py-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex justify-between">
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{shop.name}</h3>
                {getStatusBadge(shop.status)}
              </div>
              <p className="text-sm">Type: {shop.serviceType}</p>
              <p className="text-sm">Phone: {shop.phone}</p>
              <p className="text-sm">Postcode: {shop.postcode}</p>
              <p className="text-sm">Website: {formatWebsite(shop.website) || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const categories = ['Takeaway', 'Dine Restaurant', 'Café'];

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen text-white' : 'bg-gray-50 min-h-screen text-gray-900'}>
      {/* Header */}
      <header className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">UK Shop Directory</h1>
          <p className="mt-2">Find local takeaways, restaurants, and cafés near you</p>
        </div>
      </header>

      {/* Theme Toggle Button */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Search onSearchChange={setSearchTerm} />
            <Filter
              shops={mockShopData}
              onFilterChange={setFilters}
              selectedPostcode={filters.postcode}
              selectedCity={filters.city}
            />
          </div>
          <div className={`p-6 rounded-lg shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Categories</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory 
                    ? 'bg-blue-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
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
          {hasActiveFilters && (
            <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Active Filters:</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>Search: "{searchTerm}"</span>
                    )}
                    {filters.postcode && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>Postcode: {filters.postcode}</span>
                    )}
                    {filters.city && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>City: {filters.city}</span>
                    )}
                    {selectedCategory && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-orange-800 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>Category: {selectedCategory}</span>
                    )}
                  </div>
                </div>
                <button onClick={clearFilters} className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>Clear All</button>
              </div>
            </div>
          )}
          <Table shops={filteredShops} />
        </div>
      </main>
    </div>
  );
}

export default App;