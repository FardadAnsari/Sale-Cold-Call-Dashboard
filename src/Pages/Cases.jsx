import React, { useState, useEffect, useCallback, useRef } from 'react';
import CaseTable from '../components/CaseTable';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { FilterIcon } from '../Icons';
import sadMaskImg from '../images/sad-mask.png';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Helper to sanitize string values, replacing "None" or empty strings with default
const sanitizeString = (value, defaultValue = 'N/A') => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim().toLowerCase() === 'none' ||
    String(value).trim() === ''
  ) {
    return defaultValue;
  }
  return String(value).trim();
};

// Helper to transform API data for table display
const transformApiData = (apiResults) => {
  return apiResults
    .map((item) => ({
      id: item.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizeString(item.shop, 'Unknown Shop'), // Changed from item.customer to item.shop
      case_stage: sanitizeString(item.stage, 'Unknown Stage'),
      postcode: sanitizeString(item.post_code || 'N/A'),
      created_by: sanitizeString(item.created_by, 'Unknown Creator'),
      start_time: item.start_time,
      last_update: item.last_update,
    }))
    .filter((item) => item.id !== null && item.id !== undefined);
};

// Helper to extract city from address string (kept for potential future use)
const extractCityFromAddress = (address) => {
  const sanitizedAddress = sanitizeString(address, '');
  if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
  const parts = sanitizedAddress.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
};

// Helper to parse opening hours string/object (kept for potential future use)
const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'N/A',
    Tuesday: 'N/A',
    Wednesday: 'N/A',
    Thursday: 'N/A',
    Friday: 'N/A',
    Saturday: 'N/A',
    Sunday: 'N/A',
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    const parsed = {};
    for (const day in defaultHours) {
      if (
        openingHoursData[day] &&
        Array.isArray(openingHoursData[day]) &&
        openingHoursData[day].length > 0
      ) {
        parsed[day] = openingHoursData[day].map((hour) => sanitizeString(hour, 'N/A')).join(', ');
      } else {
        parsed[day] = 'Closed';
      }
    }
    return parsed;
  }
  return defaultHours;
};

// Main component for displaying and managing case data
const Cases = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem('authToken');

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

  // --- React Query for Main Case Data ---
  const {
    data: mainCaseData,
    isLoading: isMainDataLoading,
    isFetching: isMainDataFetching,
    error: mainDataError,
    refetch: refetchMainData,
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
      if (data && data.results && Array.isArray(data.results)) {
        return {
          transformedData: transformApiData(data.results),
          totalPages: data.totalPages || 1,
          currentPage: data.currentPage || currentPage,
          totalCount: data.count || 0,
        };
      } else {
        throw new Error('Invalid API response format or no results array.');
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // --- React Query for getting total pages (used for search and filters) ---
  const {
    data: totalPagesData,
  } = useQuery({
    queryKey: ['total-pages'],
    queryFn: async () => {
      const url = `https://sale.mega-data.co.uk/history/sale-sessions/?page=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.totalPages || 1;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
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
      
      const maxPages = totalPagesData || 1;
      const searchPromises = [];
      
      // Fetch all available pages dynamically
      for (let page = 1; page <= maxPages; page++) {
        searchPromises.push(
          fetch(`https://sale.mega-data.co.uk/history/sale-sessions/?page=${page}`, {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
          })
            .then(response => response.ok ? response.json() : null)
            .then(data => data && data.results ? transformApiData(data.results) : [])
            .catch(err => {
              console.error(`Error fetching page ${page}:`, err);
              return [];
            })
        );
      }
      
      const allResults = await Promise.all(searchPromises);
      const combinedResults = allResults.flat();
      
      const filteredResults = combinedResults.filter((caseItem) => {
        const searchLower = debouncedSearchQuery.toLowerCase();
        return (
          caseItem.name.toLowerCase().includes(searchLower) ||
          caseItem.created_by.toLowerCase().includes(searchLower) ||
          caseItem.case_stage.toLowerCase().includes(searchLower) ||
          caseItem.postcode.toLowerCase().includes(searchLower)
        );
      });
      
      const uniqueResults = filteredResults.filter(
        (caseItem, index, self) => index === self.findIndex((s) => s.id === caseItem.id)
      );
      
      return uniqueResults;
    },
    enabled: !!debouncedSearchQuery.trim() && !!totalPagesData,
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
    queryClient.invalidateQueries(['searchSaleSessions']);
  }, [filters.category, queryClient]);

  // --- React Query for All Cases for Filters (Cached for select options) ---
  const { data: allCasesForFiltersData } = useQuery({
    queryKey: ['allCasesForFilters', filters.category],
    queryFn: async () => {
      const maxPages = totalPagesData || 1;
      const fetchPromises = [];
      
      // Fetch all available pages dynamically
      for (let page = 1; page <= maxPages; page++) {
        fetchPromises.push(
          fetch(`https://sale.mega-data.co.uk/history/sale-sessions/?page=${page}`, {
            method: 'GET',
            headers: { accept: 'application/json', Authorization: `Bearer ${authToken}` },
          })
            .then(response => response.ok ? response.json() : null)
            .then(data => data && data.results ? transformApiData(data.results) : [])
            .catch(err => {
              console.error(`Error fetching page ${page}:`, err);
              return [];
            })
        );
      }
      
      const allData = (await Promise.all(fetchPromises)).flat();
      
      // Ensure unique case_stage and postcodes for filters
      const uniqueCaseStages = [...new Set(allData.map((item) => item.case_stage))].filter(Boolean);
      const uniquePostcodes = [...new Set(allData.map((item) => item.postcode))].filter(Boolean);
      
      return { allData, uniqueCaseStages, uniquePostcodes };
    },
    enabled: !!totalPagesData,
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Derive state from React Query
  const caseData = mainCaseData?.transformedData || [];
  const totalPages = mainCaseData?.totalPages || 1;
  const totalCount = mainCaseData?.totalCount || 0;
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

  // Handle category click
  const handleCategoryClick = (category) => {
    setCurrentPage(1);
    queryClient.invalidateQueries(['sale-sessions']);
    queryClient.invalidateQueries(['allCasesForFilters']);
  };

  // Handle case stage filter changes
  const handleCaseStageChange = (e) => {
    const caseStage = e.target.value;
    setTempFilters({
      ...tempFilters,
      category: caseStage,
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
      category: tempFilters.category,
      postcode: tempFilters.postcode,
    }));
    setShowFilters(false);
    setCurrentPage(1);
    queryClient.invalidateQueries(['sale-sessions']);
  };

  // Get unique case stages and postcodes for filter options
  const uniqueCaseStages = allCasesForFiltersData?.uniqueCaseStages || [];
  const uniquePostcodes = allCasesForFiltersData?.uniquePostcodes || [];

  const filteredPostcodesByCaseStage = tempFilters.category
    ? [
        ...new Set(
          allCasesForFiltersData?.allData
            .filter((item) => item.case_stage === tempFilters.category)
            .map((item) => item.postcode) || []
        ),
      ]
    : uniquePostcodes;

  // Determine which cases to display: search results or main category data
  const isSearchMode = debouncedSearchQuery.trim().length > 0 && searchResultsFetched;
  const displayCases = (isSearchMode ? searchResultsData || [] : caseData).filter((caseItem) => {
    const matchesCaseStage = filters.category ? caseItem.case_stage === filters.category : true;
    const matchesPostcode = filters.postcode ? caseItem.postcode === filters.postcode : true;
    return matchesCaseStage && matchesPostcode;
  });

  // Handle row click to navigate to case details page
  const handleRowClick = (caseId) => {
    if (caseId) {
      navigate(`/case/${caseId}`);
    } else {
      console.warn('Attempted to navigate to case details with a null or undefined caseId.');
    }
  };

  // Render loading state for initial page load
  if (isLoadingInitial) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <main className='container mx-auto space-y-6 p-4'>
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading session data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render error state for initial page load
  if (mainDataError) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <main className='container mx-auto space-y-6 p-4'>
          <div className='mt-20 flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p
              className='mb-4 text-center text-2xl font-medium text-white'
              style={{ lineHeight: '1.5' }}
            >
              Sorry! Unable to load session data.
            </p>
            <p className='mb-6 text-center text-gray-400'>Error: {mainDataError.message}</p>
            <button
              onClick={() => refetchMainData()}
              className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Render main content
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 p-4'>
        <div className='mt-5 flex items-center justify-between pb-4'>
          <div className='max-w-md flex-grow md:max-w-xl lg:max-w-2xl'>
            <Search
              searchTerm={searchInput}
              setSearchTerm={setSearchInput}
              isDarkMode={isDarkMode}
              isLoading={isSearchLoading || isSearchFetching}
            />
          </div>
          <div className='ml-4 flex items-center space-x-3'>
            <div className='relative inline-block text-left'>
              <button
                onClick={() => {
                  setTempFilters({ category: filters.category, postcode: filters.postcode });
                  setShowFilters(true);
                }}
                disabled={overallLoading}
                className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${overallLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FilterIcon fill={'white'} />
                <span>Filter</span>
              </button>
              {showFilters && (
                <>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={() => setShowFilters(false)}
                  ></div>
                  <div className='absolute right-4 z-50 mt-2 w-72 rounded-md border border-gray-700 bg-gray-800 shadow-lg'>
                    <div className='p-4'>
                      <div className='mb-4'>
                        <label
                          htmlFor='filter-case-stage'
                          className='mb-1 block text-sm font-medium text-gray-300'
                        >
                          Select Case Stage
                        </label>
                        <select
                          id='filter-case-stage'
                          value={tempFilters.category}
                          onChange={handleCaseStageChange}
                          className='w-full appearance-none rounded border border-gray-600 bg-gray-700 bg-[length:1em] bg-[position:right_0.75rem_center] bg-no-repeat px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                          }}
                        >
                          <option value=''>Select a Case Stage</option>
                          {uniqueCaseStages.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='mb-4'>
                        <label
                          htmlFor='filter-postcode'
                          className='mb-1 block text-sm font-medium text-gray-300'
                        >
                          Select a Postcode
                        </label>
                        <select
                          id='filter-postcode'
                          value={tempFilters.postcode}
                          onChange={handlePostcodeChange}
                          disabled={!tempFilters.category && uniquePostcodes.length === 0}
                          className='w-full appearance-none rounded border border-gray-600 bg-gray-700 bg-[length:1em] bg-[position:right_0.75rem_center] bg-no-repeat px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e")`,
                          }}
                        >
                          <option value=''>Select a Postcode</option>
                          {filteredPostcodesByCaseStage.map((postcode) => (
                            <option key={postcode} value={postcode}>
                              {postcode}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className='flex justify-between pt-2'>
                        <button
                          onClick={() => setShowFilters(false)}
                          className='rounded border border-gray-600 bg-gray-800 px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-700'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className='rounded bg-blue-600 px-6 py-2 text-sm whitespace-nowrap text-white transition-colors hover:bg-blue-700'
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
        <div className='mb-4'>
          {isSearchMode ? (
            <div>
              <h2 className='mb-2 text-xl font-semibold text-gray-200'>
                Search Results for "{debouncedSearchQuery}"
              </h2>
              <p className='text-sm text-gray-400'>
                {isSearchLoading || isSearchFetching
                  ? 'Searching...'
                  : `Found ${displayCases.length} results`}
              </p>
            </div>
          ) : null}
        </div>
        {(isSearchLoading || isSearchFetching) && (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-sm text-gray-400'>Searching...</p>
            </div>
          </div>
        )}
        {isPageLoading && !isSearchMode && (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-sm text-gray-400'>Loading page {currentPage}...</p>
            </div>
          </div>
        )}
        {searchError && (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p
              className='mb-4 text-center text-2xl font-medium text-white'
              style={{ lineHeight: '1.5' }}
            >
              Search Error
            </p>
            <p className='mb-6 text-center text-gray-400'>Error: {searchError.message}</p>
            <button
              onClick={() => refetchSearchResults()}
              className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
            >
              Try Again
            </button>
          </div>
        )}
        {!overallLoading && !mainDataError && !searchError && displayCases.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Sad Mask' className='mb-4 h-32 w-32' />
            <p
              className='text-center text-2xl font-medium text-white'
              style={{ lineHeight: '1.5' }}
            >
              {isSearchMode
                ? `No results found for "${debouncedSearchQuery}"`
                : 'Sorry! No results match your filters.'}{' '}
              <br /> Please try again.
            </p>
          </div>
        ) : (
          !overallLoading &&
          !mainDataError &&
          !searchError && (
            <>
              {!isSearchMode && (
                <div className='mb-4 flex items-center justify-between'>
                  <p className='text-sm text-gray-400'>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} sessions
                  </p>
                  <p className='text-sm text-gray-400'>
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
              <div className='space-y-8'>
                <div className='rounded-lg bg-gray-800 p-6'>
                  <CaseTable
                    cases={displayCases}
                    isDarkMode={isDarkMode}
                    onRowClick={handleRowClick}
                  />
                </div>
              </div>
              {!isSearchMode && (
                <div className='mt-12 mb-8'>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
};

export default Cases;