import React, { useState, useEffect, useCallback, useRef } from 'react';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { RestaurantIcon, CafeIcon, FilterIcon } from '../Icons';
import takeawayImg from '../images/takeaway.png';
import sadMaskImg from '../images/sad-mask.png';
import HistoryFilter from '../components/HistoryFilter';
import HistoryContent from '../components/HistoryContent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const sanitizeString = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || String(value).trim().toLowerCase() === 'none' || String(value).trim() === '') {
    return defaultValue;
  }
  return String(value).trim();
};

const transformCallTimeToMinutes = (callTime) => {
  if (!callTime) return 0;
  const parts = callTime.split(':');
  if (parts.length !== 3) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours * 60 + minutes + (seconds >= 30 ? 1 : 0);
};

const transformApiData = (apiResults) => {
  return apiResults.map((item, index) => ({
    id: item.id || `history-${Date.now()}-${index}`,
    name: sanitizeString(item.description, 'Unknown Description'),
    serviceType: "History",
    postcode: sanitizeString(item.sale_session_id, 'N/A'),
    city: 'Unknown',
    website: '',
    status: 'closed',
    address: '',
    phone: '',
    rating: 'N/A',
    total_reviews: 0,
    latitude: '',
    longitude: '',
    opening_hours: {},
    services: '',
    providers: [],
    provider_url: '',
    search_txt: '',
    category: sanitizeString(item.description, 'Unknown'),
    call_duration_minutes: transformCallTimeToMinutes(item.call_time),
    call_result: item.description,
    call_date: item.date,
  }));
};

const extractCityFromAddress = (address) => {
  const sanitizedAddress = sanitizeString(address, '');
  if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
  const parts = sanitizedAddress.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
};

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

const YourHistory = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'takeaway', selectedDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isDarkMode = true;

  const categoryMapping = {
    'takeaway': { label: 'Takeaway', searchText: 'takeaway' },
    'restaurants': { label: 'Restaurant', searchText: 'restaurants' },
    'cafe': { label: 'Café', searchText: 'cafe' }
  };

  const orderedCategories = Object.keys(categoryMapping);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    error: historyError,
    refetch: refetchHistoryData
  } = useQuery({
    queryKey: ['historyData', filters.category, filters.selectedDate?.toISOString(), currentPage],
    queryFn: async () => {
      let token = localStorage.getItem('authToken');
      if (!token) {
        try {
          const tokenResponse = await fetch('https://sale.mega-data.co.uk/api/token/', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFTOKEN': 'NGsxYu2jizjxx7jYHrccmUKuZpNKLHrwaSvBukdsyxfK01bl2gUecdhgjEqb9mXd',
            },
            body: JSON.stringify({
              email: 'terry.mealzo@co.uk',
              password: 'terry123456'
            }),
          });
          if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.json();
            throw new Error(`Failed to get token: ${tokenResponse.status} - ${JSON.stringify(errorBody)}`);
          }
          const tokenData = await tokenResponse.json();
          token = tokenData.access;
          localStorage.setItem('authToken', token);
        } catch (tokenError) {
          console.error("Token acquisition failed:", tokenError);
          throw new Error(`Authentication failed: ${tokenError.message}`);
        }
      }
      let url = `https://sale.mega-data.co.uk/history/?page=${currentPage}`;
      if (filters.selectedDate) {
        const formattedDate = filters.selectedDate.toISOString().split('T')[0];
        url += `&date=${formattedDate}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('authToken');
        }
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
    retry: (failureCount, error) => {
      if (error.message.includes('status: 401') && failureCount < 1) {
        return true;
      }
      return false;
    },
  });

  const {
    data: searchResultsData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
    refetch: refetchSearchResults,
    isFetched: searchResultsFetched,
  } = useQuery({
    queryKey: ['historySearchResults', filters.category, filters.selectedDate?.toISOString(), debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];
      let token = localStorage.getItem('authToken');
      if (!token) {
        try {
          const tokenResponse = await fetch('https://sale.mega-data.co.uk/api/token/', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'X-CSRFTOKEN': 'NGsxYu2jizjxx7jYHrccmUKuZpNKLHrwaSvBukdsyxfK01bl2gUecdhgjEqb9mXd',
            },
            body: JSON.stringify({
              email: 'terry.mealzo@co.uk',
              password: 'terry123456'
            }),
          });
          if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.json();
            throw new Error(`Failed to get token: ${tokenResponse.status} - ${JSON.stringify(errorBody)}`);
          }
          const tokenData = await tokenResponse.json();
          token = tokenData.access;
          localStorage.setItem('authToken', token);
        } catch (tokenError) {
          console.error("Token acquisition for search failed:", tokenError);
          throw new Error(`Authentication failed during search: ${tokenError.message}`);
        }
      }
      const currentCategory = filters.category;
      const searchText = categoryMapping[currentCategory]?.searchText || 'takeaway';
      let url = `https://sale.mega-data.co.uk/history/?page=${currentPage}`;
      if (filters.selectedDate) {
        const formattedDate = filters.selectedDate.toISOString().split('T')[0];
        url += `&date=${formattedDate}`;
      }
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            const combinedResults = transformApiData(data.results);
            return combinedResults.filter((shop) => {
              const searchLower = debouncedSearchQuery.toLowerCase();
              return (
                shop.name.toLowerCase().includes(searchLower) ||
                shop.postcode.toLowerCase().includes(searchLower) ||
                shop.call_result.toLowerCase().includes(searchLower) ||
                shop.call_date.toLowerCase().includes(searchLower)
              );
            });
          }
        } else {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
          }
        }
        return [];
      } catch (err) {
        console.error("Error during search:", err);
        return [];
      }
    },
    enabled: !!debouncedSearchQuery.trim(),
    staleTime: 1 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('status: 401') && failureCount < 1) {
        return true;
      }
      return false;
    },
  });

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

  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    queryClient.invalidateQueries(['historySearchResults']);
  }, [filters.category, filters.selectedDate, queryClient]);

  const displayData = historyData?.transformedData || [];
  const totalPages = historyData?.totalPages || 0;
  const isPageLoading = isHistoryFetching;
  const isLoadingInitial = isHistoryLoading && !historyData;
  const overallLoading = isLoadingInitial || isPageLoading || isSearchFetching;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: category,
    }));
    setCurrentPage(1);
    queryClient.invalidateQueries(['historyData', category]);
    queryClient.invalidateQueries(['historySearchResults', category]);
  };

  const handleApplyDateFilter = (date) => {
    setFilters((prev) => ({
      ...prev,
      selectedDate: date,
    }));
    setShowDatePicker(false);
    setCurrentPage(1);
    queryClient.invalidateQueries(['historyData', filters.category, date?.toISOString()]);
  };

  const handleCancelDateFilter = () => {
    setShowDatePicker(false);
  };

  const isSearchMode = debouncedSearchQuery.trim().length > 0 && searchResultsFetched;
  const displayShops = isSearchMode ? (searchResultsData || []) : displayData;

  const getIconForCategory = (category) => {
    switch (category) {
      case 'takeaway':
        return <img src={takeawayImg} alt="Takeaway" className="w-11 h-10 bg-transparent rounded-full" />;
      case 'restaurants':
        return <RestaurantIcon />;
      case 'cafe':
        return <CafeIcon />;
      default:
        return null;
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        {/* <header className="p-0 shadow-sm bg-gray-900">
            <div className="flex px-3 py-4 rounded-b-2xl bg-gray-700">
              {orderedCategories.map((category) => (
                <button key={category} disabled className="flex-1 flex items-center justify-center gap-2 text-lg border-0 transition-all duration-300 text-center py-4 bg-gray-700 text-gray-400 opacity-50">
                  {getIconForCategory(category)}
                  <span>{categoryMapping[category]?.label}</span>
                </button>
              ))}
            </div>
        </header> */}
        <main className="container mx-auto p-4 space-y-6">
          <div className="flex justify-center items-center mt-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-300">Loading history data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        {/* <header className="p-0 shadow-sm bg-gray-900"> 
            <div className="flex px-3 py-4 rounded-b-2xl bg-gray-700">
              {orderedCategories.map((category) => (
                <button key={category} disabled className="flex-1 flex items-center justify-center gap-2 text-lg border-0 transition-all duration-300 text-center py-4 bg-gray-700 text-gray-400 opacity-50">
                  {getIconForCategory(category)}
                  <span>{categoryMapping[category]?.label}</span>
                </button>
              ))}
            </div>       
        </header> */}
        <main className="container mx-auto p-4 space-y-6">
          <div className="flex flex-col items-center justify-center p-8 mt-20">
            <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center mb-4" style={{ lineHeight: '1.5' }}>
              Sorry! Unable to load history data.
            </p>
            <p className="text-gray-400 text-center mb-6">Error: {historyError.message}</p>
            <button onClick={() => refetchHistoryData()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* <header className="p-0 shadow-sm bg-gray-900">
          <div className="flex px-3 py-4 rounded-b-2xl bg-gray-700">
            {orderedCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                disabled={overallLoading}
                className={`flex-1 flex items-center justify-center gap-2 text-lg border-0 transition-all duration-300 text-center py-4 ${filters.category === category ? 'bg-gray-600 text-gray-200 scale-95 rounded-lg' : 'bg-gray-700 text-gray-400'} ${overallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {getIconForCategory(category)}
                <span>{categoryMapping[category]?.label}</span>
              </button>
            ))}
          </div>
      </header> */}
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mt-5 pb-4">
          <div className="max-w-md md:max-w-xl lg:max-w-2xl flex-grow">
            <Search searchTerm={searchInput} setSearchTerm={setSearchInput} isDarkMode={isDarkMode} isLoading={isSearchLoading || isSearchFetching} />
          </div>
          <div className="flex items-center space-x-3 ml-4">
            <div className="relative inline-block text-left">
              <button
                onClick={() => {
                  console.log("Filter by Date button clicked. Setting showDatePicker to true.");
                  setShowDatePicker(true);
                }}
                disabled={overallLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors bg-gray-700 border text-gray-200 hover:bg-gray-600 ${overallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FilterIcon fill={'white'} />
                <span>Filter by Date</span>
              </button>
              {showDatePicker && (
                <>
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={handleCancelDateFilter}></div>
                  <div className="absolute right-0 mt-2 z-50" style={{ top: '100%', right: '0' }}>
                    <HistoryFilter
                      isDarkMode={isDarkMode}
                      onClose={handleCancelDateFilter}
                      onApply={handleApplyDateFilter}
                      initialSelectedDate={filters.selectedDate}
                    />
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
              <p className="text-sm text-gray-400">{isSearchLoading || isSearchFetching ? 'Searching...' : `Found ${displayShops.length} results.`}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
        {(isSearchLoading || isSearchFetching) && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Searching history...</p>
            </div>
          </div>
        )}
        {isPageLoading && !isSearchMode && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Loading history page {currentPage}...</p>
            </div>
          </div>
        )}
        {historyError && (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center mb-4" style={{ lineHeight: '1.5' }}>History Error</p>
            <p className="text-gray-400 text-center mb-6">Error: {historyError.message}</p>
            <button onClick={() => refetchHistoryData()} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">Try Again</button>
          </div>
        )}
        {!overallLoading && !historyError && !searchError && displayShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center" style={{ lineHeight: '1.5' }}>{isSearchMode ? `No history results found for "${debouncedSearchQuery}"` : "Sorry! No history data found for this category."} <br /> Please try again.</p>
          </div>
        ) : (
          !overallLoading && !historyError && !searchError && (
            <>
              <div className="space-y-8">
                <HistoryContent historyItems={displayShops} />
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

export default YourHistory;
