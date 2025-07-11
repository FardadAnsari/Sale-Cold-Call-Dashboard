import React, { useState, useEffect, useCallback, useRef } from 'react';
import CaseTable from '../components/CaseTable'; // Changed import
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
  return apiResults.map((item) => ({
    id: item.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: sanitizeString(item.customer, 'Unknown Customer'),
    // Mapping item.stage to case_stage based on the image's "Case Stage" column
    case_stage: sanitizeString(item.stage, 'Unknown Stage'),
    // Assuming postcode might be in shop or customer data, defaulting to 'N/A' if not available
    postcode: sanitizeString(item.post_code || 'N/A'), // Adjusted to directly use item.post_code
    created_by: sanitizeString(item.created_by, 'Unknown Creator'),
    start_time: item.start_time, // Keep as is, format in CaseTable
    last_update: item.last_update, // Keep as is, format in CaseTable
  })).filter(item => item.id !== null && item.id !== undefined);
};

// Helper to extract city from address string (No longer directly used for CaseTable but kept for other potential uses in AdminZone)
const extractCityFromAddress = (address) => {
  const sanitizedAddress = sanitizeString(address, '');
  if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
  const parts = sanitizedAddress.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
};

// Helper to parse opening hours string/object (No longer directly used for CaseTable but kept for other potential uses in AdminZone)
const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'N/A', Tuesday: 'N/A', Wednesday: 'N/A',
    Thursday: 'N/A', Friday: 'N/A', Saturday: 'N/A', Sunday: 'N/A'
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    const parsed = {};
    for (const day in defaultHours) {
      if (openingHoursData[day] && Array.isArray(openingHoursData[day]) && openingHoursData[day].length > 0) {
        parsed[day] = openingHoursData[day].map(hour => sanitizeString(hour, 'N/A')).join(', ');
      } else {
        parsed[day] = 'Closed';
      }
    }
    return parsed;
  }
  return defaultHours;
};

// Main component for displaying and managing shop data
const AdminZone = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem("authToken");

  // State for search term and filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ city: '', postcode: '', category: '' });
  const [tempFilters, setTempFilters] = useState({ city: '', postcode: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const itemsPerPage = 10;
  const isDarkMode = true;

  // Mapping for categories to their labels and search texts
  const categoryMapping = {}; // This mapping seems unused in the context of the new CaseTable

  const orderedCategories = Object.keys(categoryMapping);

  // --- React Query for Main Shop Data (now Case Data) ---
  const {
    data: mainCaseData, // Renamed from mainShopData
    isLoading: isMainDataLoading,
    isFetching: isMainDataFetching,
    error: mainDataError,
    refetch: refetchMainData
  } = useQuery({
    queryKey: ['sale-sessions', filters.category, currentPage],
    queryFn: async () => {
      const url = `https://sale.mega-data.co.uk/history/sale-sessions/?page=${currentPage}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data)) {
        return {
          transformedData: transformApiData(data),
          totalPages: Math.ceil(data.length / itemsPerPage) || 1, // This totalPages calculation might not be accurate if the API only returns a subset per page. Consider if API provides total count.
          currentPage: currentPage,
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
    queryKey: ['searchSaleSessions', filters.category, debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];
      // Fetch all available pages to search comprehensively if API doesn't support server-side search
      // NOTE: This approach fetches multiple pages for client-side search.
      // For large datasets, a server-side search API would be more efficient.
      const searchPromises = [1, 2, 3].map(async (page) => { // Assuming up to 3 pages for search, adjust as needed
        const url = `https://sale.mega-data.co.uk/history/sale-sessions/?page=${page}`;
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              return transformApiData(data);
            }
          }
          return [];
        } catch (err) {
          console.error(`Error fetching page ${page}:`, err);
          return [];
        }
      });
      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults.flat();
      const filteredResults = combinedResults.filter((caseItem) => { // Changed 'shop' to 'caseItem'
        const searchLower = debouncedSearchQuery.toLowerCase();
        return (
          caseItem.name.toLowerCase().includes(searchLower) ||
          caseItem.created_by.toLowerCase().includes(searchLower) ||
          caseItem.case_stage.toLowerCase().includes(searchLower) || // Changed 'category' to 'case_stage'
          caseItem.postcode.toLowerCase().includes(searchLower) // Added postcode to search
        );
      });
      const uniqueResults = filteredResults.filter((caseItem, index, self) => // Changed 'shop' to 'caseItem'
        index === self.findIndex((s) => s.id === caseItem.id)
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

  // Clear debouncedSearchQuery and searchInput when category changes (this might not be needed for 'cases' table)
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    queryClient.invalidateQueries(['searchSaleSessions']);
  }, [filters.category, queryClient]); // Keeping filters.category for now, though it might not apply directly to 'cases'

  // --- React Query for All Shops for Filters (Cached for select options) ---
  // This query will now fetch all cases for filter options
  const { data: allCasesForFiltersData } = useQuery({ // Renamed from allShopsForFiltersData
    queryKey: ['allCasesForFilters', filters.category], // Retaining filters.category as part of key
    queryFn: async () => {
      const fetchPromises = [1, 2, 3].map(async (page) => { // Fetching multiple pages for filter options
        const url = `https://sale.mega-data.co.uk/history/sale-sessions/?page=${page}`;
        const response = await fetch(url, { // Added headers for authentication
          method: 'GET',
          headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? transformApiData(data) : [];
        }
        return [];
      });
      const allData = (await Promise.all(fetchPromises)).flat();
      // Ensure unique case_stage and postcodes for filters
      const uniqueCaseStages = [...new Set(allData.map(item => item.case_stage))].filter(Boolean);
      const uniquePostcodes = [...new Set(allData.map(item => item.postcode))].filter(Boolean);
      return { allData, uniqueCaseStages, uniquePostcodes };
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Derive state from React Query
  const caseData = mainCaseData?.transformedData || []; // Renamed from shopData
  const totalPages = mainCaseData?.totalPages || 1;
  const totalCount = totalPages * itemsPerPage; // This might be inaccurate without a total count from API
  const isPageLoading = isMainDataFetching;
  const isLoadingInitial = isMainDataLoading && !mainCaseData;

  // Combined loading state for UI
  const overallLoading = isLoadingInitial || isPageLoading || isSearchFetching;

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle category click (No direct "category" for cases, but maintaining the prop for consistency or future use)
  const handleCategoryClick = (category) => {
    setCurrentPage(1);
    // filters.category is currently not directly used in the API call for 'sale-sessions',
    // but invalidate queries might be useful if category implied a different endpoint.
    queryClient.invalidateQueries(['sale-sessions']);
    queryClient.invalidateQueries(['allCasesForFilters']);
  };

  // Handle city and postcode filter changes
  const handleCaseStageChange = (e) => { // Renamed from handleCityChange
    const caseStage = e.target.value;
    setTempFilters({
      ...tempFilters,
      category: caseStage, // Using 'category' field for case_stage filter
      postcode: '', // Reset postcode if case stage changes
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
      category: tempFilters.category, // Applying case_stage to the 'category' filter
      postcode: tempFilters.postcode,
    }));
    setShowFilters(false);
    setCurrentPage(1);
    queryClient.invalidateQueries(['sale-sessions']);
  };

  // Get unique case stages and postcodes for filter options
  const uniqueCaseStages = allCasesForFiltersData?.uniqueCaseStages || []; // Renamed from uniqueCities
  const uniquePostcodes = allCasesForFiltersData?.uniquePostcodes || [];

  const filteredPostcodesByCaseStage = tempFilters.category
    ? [...new Set(allCasesForFiltersData?.allData.filter((item) => item.case_stage === tempFilters.category).map((item) => item.postcode) || [])]
    : uniquePostcodes;

  // Determine which cases to display: search results or main category data
  const isSearchMode = debouncedSearchQuery.trim().length > 0 && searchResultsFetched;
  const displayCases = (isSearchMode ? (searchResultsData || []) : caseData).filter((caseItem) => { // Renamed from displayShops
    const matchesCaseStage = filters.category ? caseItem.case_stage === filters.category : true; // Using filters.category for case_stage
    const matchesPostcode = filters.postcode ? caseItem.postcode === filters.postcode : true;
    return matchesCaseStage && matchesPostcode;
  });

  // Handle row click to navigate to case details page
  const handleRowClick = (caseId) => { // Renamed from shopId
    if (caseId) {
      navigate(`/case/${caseId}`); // Assuming a new route for case details
    } else {
      console.warn("Attempted to navigate to case details with a null or undefined caseId.");
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
              <p className="text-xl text-gray-300">Loading session data...</p>
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
              Sorry! Unable to load session data.
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
              <button onClick={() => { setTempFilters({ category: filters.category, postcode: filters.postcode }); setShowFilters(true); }} disabled={overallLoading} className={`flex items-center gap-2 px-4 py-2 rounded transition-colors bg-gray-700 border text-gray-200 hover:bg-gray-600 ${overallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FilterIcon fill={'white'} />
                <span>Filter</span>
              </button>
              {showFilters && (
                <>
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowFilters(false)}></div>
                  <div className="absolute right-4 mt-2 w-72 rounded-md shadow-lg z-50 bg-gray-800 border border-gray-700">
                    <div className="p-4">
                      <div className="mb-4">
                        <label htmlFor="filter-case-stage" className="block text-sm font-medium mb-1 text-gray-300">Select Case Stage</label>
                        <select id="filter-case-stage" value={tempFilters.category} onChange={handleCaseStageChange} className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border-gray-600 appearance-none bg-no-repeat bg-[length:1em] bg-[position:right_0.75rem_center] pr-10" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")` }}>
                          <option value="">Select a Case Stage</option>
                          {uniqueCaseStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="filter-postcode" className="block text-sm font-medium mb-1 text-gray-300">Select a Postcode</label>
                        <select id="filter-postcode" value={tempFilters.postcode} onChange={handlePostcodeChange} disabled={!tempFilters.category && uniquePostcodes.length === 0} className="w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 border-gray-600 appearance-none bg-no-repeat bg-[length:1em] bg-[position:right_0.75rem_center] pr-10" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")` }}>
                          <option value="">Select a Postcode</option>
                          {filteredPostcodesByCaseStage.map((postcode) => <option key={postcode} value={postcode}>{postcode}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-between pt-2">
                        <button onClick={() => setShowFilters(false)} className="px-4 py-2 text-sm rounded transition-colors bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700">Cancel</button>
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
              <p className="text-sm text-gray-400">{isSearchLoading || isSearchFetching ? 'Searching...' : `Found ${displayCases.length} results`}</p>
            </div>
          ) : null}
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
        {!overallLoading && !mainDataError && !searchError && displayCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center" style={{ lineHeight: '1.5' }}>{isSearchMode ? `No results found for "${debouncedSearchQuery}"` : "Sorry! No results match your filters."} <br /> Please try again.</p>
          </div>
        ) : (
          !overallLoading && !mainDataError && !searchError && (
            <>
              {!isSearchMode && (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} sessions</p>
                  <p className="text-sm text-gray-400">Page {currentPage} of {totalPages}</p>
                </div>
              )}
              <div className="space-y-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <CaseTable cases={displayCases} isDarkMode={isDarkMode} onRowClick={handleRowClick} /> {/* Changed component and prop */}
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