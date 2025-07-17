import { useState, useEffect,  useRef } from 'react';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { FilterIcon } from '../Icons';

import sadMaskImg from '../images/sad-mask.png';
import HistoryFilter from '../components/HistoryFilter';
import HistoryContent from '../components/HistoryContent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';


const YourHistory = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'takeaway', selectedDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
 
  const isDarkMode = true;

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    error: historyError,
    refetch: refetchHistoryData,
  } = useQuery({
    queryKey: [
      'historyData',
      filters.selectedDate?.toISOString(),
      
      currentPage,
    ],
    queryFn: async () => {
      const authToken = sessionStorage.getItem('authToken');

      let url = `https://sale.mega-data.co.uk/history/?page=${currentPage}`;

      if (filters.selectedDate) {
        const formattedDate = filters.selectedDate.toISOString().split('T')[0];
        url += `&date=${formattedDate}`;
      }

      try {
        const response = await axios.get(url, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
        console.log(response);

        return response.data;
      } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          sessionStorage.removeItem('authToken');
        }
        throw new Error(`HTTP error! status: ${error.response?.status}`);
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    retry: (failureCount, error) => {
      return error.message.includes('status: 401') && failureCount < 1;
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

  const totalPages = historyData?.totalPages || 0;
  const isPageLoading = isHistoryFetching;
  const isLoadingInitial = isHistoryLoading && !historyData;
  const overallLoading = isLoadingInitial || isPageLoading ;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

const isSearchMode = debouncedSearchQuery.trim().length > 0;

const displayShops = isSearchMode
  ? historyData?.results.filter((shop) => {
      const searchLower = debouncedSearchQuery.toLowerCase();
      return (
        shop.name.toLowerCase().includes(searchLower) ||
        shop.postcode.toLowerCase().includes(searchLower) ||
        shop.call_result.toLowerCase().includes(searchLower) ||
        shop.call_date.toLowerCase().includes(searchLower)
      );
    })
  : historyData?.results;
  // console.log(displayShops);

  if (isLoadingInitial) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
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

      <main className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center mt-5 pb-4">
          <div className="max-w-md md:max-w-xl lg:max-w-2xl flex-grow">
            <Search searchTerm={searchInput} setSearchTerm={setSearchInput} isDarkMode={isDarkMode}  />
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
        {!overallLoading && !historyError && displayShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
            <p className="text-white text-2xl font-medium text-center" style={{ lineHeight: '1.5' }}>{isSearchMode ? `No history results found for "${debouncedSearchQuery}"` : "Sorry! No history data found for this category."} <br /> Please try again.</p>
          </div>
        ) : (
          !overallLoading && !historyError && (
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
