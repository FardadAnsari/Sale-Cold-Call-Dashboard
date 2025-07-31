import { useState, useEffect, useRef } from 'react';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { FilterIcon } from '../Icons';

import sadMaskImg from '../images/sad-mask.png';
import HistoryFilter from '../components/HistoryFilter';
import HistoryContent from '../components/HistoryContent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import { useParams } from 'react-router-dom';

const UserHistory = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ selectedDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isDarkMode = true;

  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 2000);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    queryClient.invalidateQueries(['historyData']);
  }, [filters.selectedDate, queryClient]);

  const authToken = sessionStorage.getItem('authToken');

  const {
    data: historyData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'historyData',
      filters.selectedDate?.toISOString(),
      currentPage,
      debouncedSearchQuery,
    ],
    queryFn: async () => {
      const formattedDate = filters.selectedDate
        ? filters.selectedDate.toLocaleDateString('en-CA')
        : undefined;
      const res = await axios.get(`${API_BASE_URL}/history/`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          user_id: id,
          page: currentPage,
          date: formattedDate || undefined,
          search: debouncedSearchQuery || undefined,
        },
      });
      console.log(res);

      return res.data; // { results, totalPages, currentPage }
    },
    keepPreviousData: true,
  });

  const totalPages = historyData?.totalPages || 1;
  const isInitialLoading = isLoading && !historyData;
  const overallLoading = isInitialLoading || isFetching;
  const isSearchMode = debouncedSearchQuery.length > 0;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyDateFilter = (date) => {
    setFilters((prev) => ({ ...prev, selectedDate: date }));
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  const handleCancelDateFilter = () => {
    setShowDatePicker(false);
  };

  const handleClearFilters = () => {
    setFilters({ selectedDate: null });
    setSearchInput('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
    queryClient.invalidateQueries(['historyData']);
  };

  const filteredResults = isSearchMode
    ? historyData?.results.filter((item) => {
        const search = debouncedSearchQuery.toLowerCase();
        return (
          item?.name?.toLowerCase().includes(search) ||
          item?.postcode?.toLowerCase().includes(search) ||
          item?.call_result?.toLowerCase().includes(search) ||
          item?.call_date?.toLowerCase().includes(search)
        );
      })
    : historyData?.results;

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 px-4 py-6'>
        <div className='flex items-center justify-between pb-4'>
          <div className='max-w-md flex-grow md:max-w-xl lg:max-w-2xl'>
            <Search
              searchTerm={searchInput}
              setSearchTerm={setSearchInput}
              isDarkMode={isDarkMode}
              isLoading={isFetching}
            />
          </div>
          <div className='ml-4 flex items-center space-x-3'>
            {(filters.selectedDate || debouncedSearchQuery) && (
              <button
                onClick={handleClearFilters}
                className='rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
              >
                Clear Filters
              </button>
            )}
            <div className='relative inline-block text-left'>
              <button
                onClick={() => setShowDatePicker(true)}
                disabled={overallLoading}
                className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${overallLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <FilterIcon fill={'white'} />
                <span>Filter by Date</span>
              </button>
              {showDatePicker && (
                <>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelDateFilter}
                  ></div>
                  <div className='absolute right-0 z-50 mt-2'>
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

        {isInitialLoading && (
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading user history data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p className='mb-4 text-center text-2xl font-medium text-white'>
              Unable to load history data.
            </p>
            <p className='mb-6 text-center text-gray-400'>Error: {error.message}</p>
            <button
              onClick={() => refetch()}
              className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
            >
              Try Again
            </button>
          </div>
        )}

        {!overallLoading && !error && filteredResults?.length === 0 && (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='No Results' className='mb-4 h-32 w-32' />
            <p className='text-center text-2xl font-medium text-white'>
              No history found. Please try different filters.
            </p>
          </div>
        )}

        {!overallLoading && !error && filteredResults?.length > 0 && (
          <>
            <div className='space-y-8'>
              <HistoryContent historyItems={filteredResults} />
            </div>
            <div className='mt-12 mb-8'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserHistory;
