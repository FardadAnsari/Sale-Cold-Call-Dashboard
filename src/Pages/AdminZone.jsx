import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from '../components/Table';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { FilterIcon } from '../Icons';
import sadMaskImg from '../images/sad-mask.png';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Helper to sanitize string values, replacing "None" or empty strings with default
const sanitizeString = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || String(value).trim().toLowerCase() === 'none' || String(value).trim() === '') {
    return defaultValue;
  }
  return String(value).trim();
};

// Helper to transform API data for table display
const transformApiData = (apiResults) => {
  return apiResults.map((item, index) => ({
    id: item.id || item.shop_id_company || `shop-${Date.now()}-${index}`,
    name: sanitizeString(item.shop_name, 'Unknown Shop'),
    serviceType: sanitizeString(item.category, 'Unknown'),
    postcode: sanitizeString(item.postcode, 'N/A'),
    city: extractCityFromAddress(item.address) || 'Unknown',
    website: sanitizeString(item.website, ''),
    status: item.is_open_now ? 'open' : 'closed',
    address: sanitizeString(item.address, ''),
    phone: sanitizeString(item.phone, ''),
    rating: sanitizeString(item.rating, 'N/A'),
    total_reviews: item.total_reviews || 0,
    latitude: item.latitude || '',
    longitude: item.longitude || '',
    opening_hours: item.opening_hours || {}, // Ensure it's an object for safety
    services: sanitizeString(item.services, ''),
    providers: item.providers || [],
    provider_url: sanitizeString(item.provider_url, ''),
    search_txt: sanitizeString(item.search_txt, ''),
    category: sanitizeString(item.category, 'Unknown')
  })).filter(item => item.id !== null && item.id !== undefined); // Ensure IDs are not null/undefined
};

// Helper to extract city from address string
const extractCityFromAddress = (address) => {
  const sanitizedAddress = sanitizeString(address, '');
  if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
  const parts = sanitizedAddress.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
};

// Helper to transform single shop API data (kept for consistency, though now used in ShopDetailsPage)
const transformSingleShopData = (apiItem) => {
  if (!apiItem) return null;
  return {
    id: apiItem.id || apiItem.shop_id_company, // Use the integer ID first
    name: sanitizeString(apiItem.shop_name, 'Unknown Shop'),
    serviceType: sanitizeString(apiItem.category, 'Unknown'),
    postcode: sanitizeString(apiItem.postcode, 'N/A'),
    city: extractCityFromAddress(apiItem.address) || 'Unknown',
    website: sanitizeString(apiItem.website, ''),
    status: apiItem.is_open_now ? 'open' : 'closed',
    address: sanitizeString(apiItem.address, ''),
    phone: sanitizeString(apiItem.phone, ''),
    rating: sanitizeString(apiItem.rating, 'N/A'),
    total_reviews: apiItem.total_reviews || 0,
    latitude: apiItem.latitude || '',
    longitude: apiItem.longitude || '',
    // Use the parseOpeningHours helper
    openingHours: parseOpeningHours(apiItem.opening_hours),
    services: sanitizeString(apiItem.services, ''),
    providers: apiItem.providers || [],
    provider_url: sanitizeString(apiItem.provider_url, ''),
    search_txt: sanitizeString(apiItem.search_txt, ''),
    category: sanitizeString(apiItem.category, 'Unknown')
  };
};

// Helper to parse opening hours string/object (kept for consistency, though now used in ShopDetailsPage)
const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'N/A', Tuesday: 'N/A', Wednesday: 'N/A',
    Thursday: 'N/A', Friday: 'N/A', Saturday: 'N/A', Sunday: 'N/A'
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    // If it's an object (like your sample), clean "None" and empty arrays
    const parsed = {};
    for (const day in defaultHours) {
      if (openingHoursData[day] && Array.isArray(openingHoursData[day]) && openingHoursData[day].length > 0) {
        parsed[day] = openingHoursData[day].map(hour => sanitizeString(hour, 'N/A')).join(', ');
      } else {
        parsed[day] = 'Closed'; // Or N/A if you prefer
      }
    }
    return parsed;
  }
  // If it's a string, or any other unexpected format
  return defaultHours;
};

// Main component for displaying and managing shop data
const AdminZone = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem("authToken")

  // State for search term and filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ city: '', postcode: '', category: '' });
  const [tempFilters, setTempFilters] = useState({ city: '', postcode: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const itemsPerPage = 10;
  const isDarkMode = true; // Assuming dark mode is always on for this component based on previous contexts

  // Mapping for categories to their labels and search texts
  const categoryMapping = {
    // Categories removed
  };

  const orderedCategories = Object.keys(categoryMapping);

  // --- React Query for Main Shop Data ---
  const {
    data: mainShopData,
    isLoading: isMainDataLoading,
    isFetching: isMainDataFetching,
    error: mainDataError,
    refetch: refetchMainData
  } = useQuery({
    queryKey: ['shops', filters.category, currentPage],
    queryFn: async () => {
      const currentSearchText = categoryMapping[filters.category]?.searchText || 'takeaway';
      const url = `https://sale.mega-data.co.uk/Shops/?search=${currentSearchText}&page=${currentPage}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.results && Array.isArray(data.results)) {
        return {
          transformedData: transformApiData(data.results),
          totalPages: data.totalPages || 0,
          currentPage: data.currentPage || currentPage,
        };
      } else {
        throw new Error('Invalid API response format or no results array.');
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // --- React Query for Search Results ---
  const {
    data: searchResultsData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
    refetch: refetchSearchResults,
    isFetched: searchResultsFetched,
  } = useQuery({
    queryKey: ['searchResults', filters.category, debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];
      const currentCategory = filters.category;
      const searchText = categoryMapping[currentCategory]?.searchText || 'takeaway';
      // Fetch multiple pages for search to cover more results
      const searchPromises = [1, 2, 3].map(async (page) => {
        const url = `https://sale.mega-data.co.uk/Shops/?search=${searchText}&page=${page}`;
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
              return transformApiData(data.results);
            }
          }
          return [];
        } catch (err) {
          console.error(`Error searching ${currentCategory} page ${page}:`, err);
          return [];
        }
      });
      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults.flat();
      // Filter results by search query client-side from combined results
      const filteredResults = combinedResults.filter((shop) => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        return (
          shop.name.toLowerCase().includes(searchLower) ||
          shop.phone.toLowerCase().includes(searchLower) ||
          shop.postcode.toLowerCase().includes(searchLower) ||
          shop.address.toLowerCase().includes(searchLower) ||
          shop.city.toLowerCase().includes(searchLower)
        );
      });
      // Remove duplicates
      const uniqueResults = filteredResults.filter((shop, index, self) =>
        index === self.findIndex((s) => s.id === shop.id)
      );
      return uniqueResults;
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 1 * 60 * 1000,
  });

  // Debounce logic for setting the actual query term
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 500);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  // Clear debouncedSearchQuery and searchInput when category changes
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    queryClient.invalidateQueries(['searchResults']);
  }, [filters.category, queryClient]);

  // --- React Query for All Shops for Filters (Cached for select options) ---
  const { data: allShopsForFiltersData } = useQuery({
    queryKey: ['allShopsForFilters', filters.category],
    queryFn: async () => {
      const initialSearchText = categoryMapping[filters.category]?.searchText || 'takeaway';
      const fetchPromises = [1, 2, 3].map(async (page) => {
        const url = `https://sale.mega-data.co.uk/Shops/?search=${initialSearchText}&page=${page}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Make sure to filter out items without a proper ID here too for consistency
          return data.results ? transformApiData(data.results) : [];
        }
        return [];
      });
      const allData = (await Promise.all(fetchPromises)).flat();
      return allData;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Derive state from React Query
  const shopData = mainShopData?.transformedData || [];
  const totalPages = mainShopData?.totalPages || 0;
  const totalCount = totalPages * itemsPerPage;
  const isPageLoading = isMainDataFetching;
  const isLoadingInitial = isMainDataLoading && !mainShopData;

  // Combined loading state for UI
  const overallLoading = isLoadingInitial || isPageLoading || isSearchFetching;

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle category click to filter shops by category
  const handleCategoryClick = (category) => {
    // We remove category logic here since the categories are removed
    setCurrentPage(1);
    queryClient.invalidateQueries(['shops']);
    queryClient.invalidateQueries(['allShopsForFilters']);
  };

  // Handle city and postcode filter changes
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

  // Apply filters and fetch filtered data
  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      city: tempFilters.city,
      postcode: tempFilters.postcode,
    }));
    setShowFilters(false);
    setCurrentPage(1);
    queryClient.invalidateQueries(['shops']);
  };

  // Get unique cities and postcodes for filter options
  const uniqueCities = [...new Set(allShopsForFiltersData?.map((shop) => shop.city) || [])];
  const uniquePostcodes = [...new Set(allShopsForFiltersData?.map((shop) => shop.postcode) || [])];
  const filteredPostcodesByCity = tempFilters.city
    ? [...new Set(allShopsForFiltersData?.filter((shop) => shop.city === tempFilters.city).map((shop) => shop.postcode) || [])]
    : uniquePostcodes;

  // Determine which shops to display: search results or main category data
  const isSearchMode = debouncedSearchQuery.trim().length > 0 && searchResultsFetched;
  const displayShops = (isSearchMode ? (searchResultsData || []) : shopData).filter((shop) => {
    const matchesCity = filters.city ? shop.city === filters.city : true;
    const matchesPostcode = filters.postcode ? shop.postcode === filters.postcode : true;
    return matchesCity && matchesPostcode;
  });

  // Handle row click to navigate to shop details page
  const handleRowClick = (shopId) => {
    console.log("Attempting to navigate to shopId:", shopId); // Diagnostic log
    if (shopId) {
      navigate(`/shop/${shopId}`); // Navigate to the new route
    } else {
      console.warn("Attempted to navigate to shop details with a null or undefined shopId.");
    }
  };

  // Render loading state for initial page load
  if (isLoadingInitial) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <main className="container mx-auto p-4 space-y-6">
          <div className="flex justify-center items-center mt-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-300">Loading shop data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render error state for initial page load
  if (mainDataError) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <main className="container mx-auto p-4 space-y-6">
          <div className="flex flex-col items-center justify-center p-8 mt-20">
            <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center mb-4" style={{ lineHeight: '1.5' }}>
              Sorry! Unable to load shop data.
            </p>
            <p className="text-gray-400 text-center mb-6">Error: {mainDataError.message}</p>
            <button onClick={() => refetchMainData()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Render main content
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mt-5 pb-4">
          <div className="max-w-md md:max-w-xl lg:max-w-2xl flex-grow">
            <Search searchTerm={searchInput} setSearchTerm={setSearchInput} isDarkMode={isDarkMode} isLoading={isSearchLoading || isSearchFetching} />
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <div className="relative inline-block text-left">
              <button onClick={() => { setTempFilters({ city: filters.city, postcode: filters.postcode }); setShowFilters(true); }} disabled={overallLoading} className={`flex items-center gap-2 px-4 py-2 rounded transition-colors bg-gray-700 border text-gray-200 hover:bg-gray-600 ${overallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FilterIcon fill={'white'} />
                <span>Filter</span>
              </button>
              {showFilters && (
                <>
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowFilters(false)}></div>
                  <div className="absolute right-4 mt-2 w-72 rounded-md shadow-lg z-50 bg-gray-800 border border-gray-700">
                    <div className="p-4">
                      {/* Select a City */}
                      <div className="mb-4">
                        <label htmlFor="filter-city" className="block text-sm font-medium mb-1 text-gray-300">Select a City</label>
                        <select id="filter-city" value={tempFilters.city} onChange={handleCityChange} className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border-gray-600 appearance-none bg-no-repeat bg-[length:1em] bg-[position:right_0.75rem_center] pr-10" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")` }}>
                          <option value="">e.g. London</option>
                          {uniqueCities.map((city) => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </div>
                      {/* Select a Postcode */}
                      <div className="mb-4">
                        <label htmlFor="filter-postcode" className="block text-sm font-medium mb-1 text-gray-300">Select a Postcode</label>
                        <select id="filter-postcode" value={tempFilters.postcode} onChange={handlePostcodeChange} disabled={!tempFilters.city} className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border-gray-600 appearance-none bg-no-repeat bg-[length:1em] bg-[position:right_0.75rem_center] pr-10" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")` }}>
                          <option value="">e.g. ML66JQ</option>
                          {filteredPostcodesByCity.map((postcode) => <option key={postcode} value={postcode}>{postcode}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-between pt-2">
                        {/* Cancel Button */}
                        <button onClick={() => setShowFilters(false)} className="px-4 py-2 text-sm rounded transition-colors bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700">Cancel</button>
                        {/* Apply Button */}
                        <button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded transition-colors whitespace-nowrap">Apply</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mb-4">
          {isSearchMode ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-200 mb-2">Search Results for "{debouncedSearchQuery}"</h2>
              <p className="text-sm text-gray-400">{isSearchLoading || isSearchFetching ? 'Searching...' : `Found ${displayShops.length} results`}</p>
            </div>
          ) : (
            // This entire block is now removed as per your request.
            null
          )}
        </div>
        {(isSearchLoading || isSearchFetching) && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Searching...</p>
            </div>
          </div>
        )}
        {isPageLoading && !isSearchMode && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Loading page {currentPage}...</p>
            </div>
          </div>
        )}
        {searchError && (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center mb-4" style={{ lineHeight: '1.5' }}>Search Error</p>
            <p className="text-gray-400 text-center mb-6">Error: {searchError.message}</p>
            <button onClick={() => refetchSearchResults()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">Try Again</button>
          </div>
        )}
        {!overallLoading && !mainDataError && !searchError && displayShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center" style={{ lineHeight: '1.5' }}>{isSearchMode ? `No results found for "${debouncedSearchQuery}"` : "Sorry! No results match your filters."} <br /> Please try again.</p>
          </div>
        ) : (
          !overallLoading && !mainDataError && !searchError && (
            <>
              {!isSearchMode && ( // Only show this if not in search mode
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} shops</p>
                  <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
                </div>
              )}
              <div className="space-y-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <Table shops={displayShops} isDarkMode={isDarkMode} onRowClick={handleRowClick} />
                </div>
              </div>
              {!isSearchMode && (
                <div className="mt-12 mb-8">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isDarkMode={isDarkMode} />
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
};

export default AdminZone;
