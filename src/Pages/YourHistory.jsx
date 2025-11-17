import { useState, useEffect, useRef } from 'react';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { FaFileExport } from 'react-icons/fa6';

import sadMaskImg from '../images/sad-mask.png';
import HistoryContent from '../components/HistoryContent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import useUser from 'src/useUser';
import DateFilter from '@components/DateFilter';
import { BsCalendar2Date } from 'react-icons/bs';
import CaseDrawer from '../components/CaseDrawer'; // Import CaseDrawer


const YourHistory = () => {
  const { data: user } = useUser();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filters, setFilters] = useState({ selectedDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isDarkMode = true;

  // Add state for CaseDrawer
  const [isCaseDrawerOpen, setIsCaseDrawerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // console.log(user);

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

  // Add handlers for CaseDrawer
  const handleOpenCase = (caseItem) => {
    // console.log('Opening case:', caseItem);
    setSelectedCase(caseItem);
    setIsCaseDrawerOpen(true);
  };

  const handleCloseCaseDrawer = () => {
    setIsCaseDrawerOpen(false);
    setSelectedCase(null);
  };

  // Enhanced handleExport function with proper authorization
  const handleExport = async () => {
    setLoading(true);

    try {
      const authToken = sessionStorage.getItem('authToken');

      const response = await axios.get(`${API_BASE_URL}/history/export_history/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = response.data;

      // Get the results array
      const historyData = data.results;

      // Convert to CSV
      const headers = Object.keys(historyData[0]);
      const csvRows = [
        headers.join(','),
        ...historyData.map((row) =>
          headers
            .map((header) => {
              const value = row[header] || '';
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',')
        ),
      ];

      const csvString = csvRows.join('\n');

      // Download file
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `history-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          user_id: user.id,
          page: currentPage,
          date: formattedDate || undefined,
          shop_name: debouncedSearchQuery || undefined,
        },
      });
      // console.log(res);

      return res.data; // { results, totalPages, currentPage }
    },
    keepPreviousData: true,
    enabled: !!authToken && !!user?.id, // Only run query if authenticated and user data is available
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

  const filteredResults = historyData?.results;

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
                className={`flex items-center gap-2 rounded border bg-gray-700 p-2 text-gray-200 transition-colors hover:bg-gray-600 ${overallLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <BsCalendar2Date size={25} fill={'white'} />
              </button>
              {showDatePicker && (
                <>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelDateFilter}
                  ></div>
                  <div className='absolute right-0 z-50 mt-2'>
                    <DateFilter
                      isDarkMode={isDarkMode}
                      onClose={handleCancelDateFilter}
                      onApply={handleApplyDateFilter}
                      initialSelectedDate={filters.selectedDate}
                    />
                  </div>
                </>
              )}
            </div>
            <div>
              <button
                onClick={handleExport}
                disabled={loading || !authToken || !user?.id}
                className={`export-button flex items-center gap-2 rounded bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 ${loading || !authToken || !user?.id ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {loading ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <span>Export CSV</span>
                    <FaFileExport className='text-sm' />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isInitialLoading && (
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading your history data...</p>
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
              <HistoryContent
                historyItems={filteredResults}
                onOpenCase={handleOpenCase} // Pass the handler
              />
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

        {/* CaseDrawer Component */}
        <CaseDrawer
          isOpen={isCaseDrawerOpen}
          onClose={handleCloseCaseDrawer}
          caseData={selectedCase}
          mode='case'
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
};

export default YourHistory;
