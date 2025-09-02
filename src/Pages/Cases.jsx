import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Search from '../components/Search';
import CaseTable from '../components/CaseTable';
import Pagination from '../components/Pagination';
import sadMaskImg from '../images/sad-mask.png';
import { API_BASE_URL } from 'src/api';
import CasesFilter from '../components/CasesFilter';
import { FilterIcon } from '../Icons';


const Cases = () => {
  const authToken = sessionStorage.getItem('authToken');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ selectedDate: null });
  const [ordering, setOrdering] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isDarkMode = true;

  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 2000);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Reset search and page when date filter changes
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
  }, [filters.selectedDate]);

  const formattedDate = filters.selectedDate
    ? filters.selectedDate.toLocaleDateString('en-UK') 
    : undefined;

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['sale-sessions', debouncedSearchQuery, currentPage, formattedDate, ordering],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/history/sale-sessions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          search: debouncedSearchQuery || undefined,
          page: currentPage,
          start_time: formattedDate || undefined,
          ordering: ordering.length ? ordering.join(',') : undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const overallLoading = isLoading || isFetching;
  const isEmpty = !overallLoading && data?.results?.length === 0;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyDateFilter = (date) => {
    setFilters((prev) => ({ ...prev, selectedDate: date }));
    setShowDatePicker(false);
  };

  const handleCancelDateFilter = () => {
    setShowDatePicker(false);
  };

  const handleClearFilters = () => {
    setFilters({ selectedDate: null });
    setCurrentPage(1);
    setSearchInput('');
    setDebouncedSearchQuery('');
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div className='max-w-md flex-grow md:max-w-xl lg:max-w-2xl'>
            <Search
              searchTerm={searchInput}
              setSearchTerm={setSearchInput}
              isDarkMode={isDarkMode}
              isLoading={isLoading}
            />
          </div>
          <div className='ml-4 flex items-center space-x-3'>
            {filters.selectedDate && (
              <button
                onClick={handleClearFilters}
                className='ml-2 rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
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
                <span>Filter by Start Time</span>
              </button>

              {showDatePicker && (
                <>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelDateFilter}
                  ></div>
                  <div className='absolute right-0 z-50 mt-2'>
                    <CasesFilter
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

        {isLoading ? (
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading cases data...</p>
            </div>
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p className='text-xl text-white'>Failed to load Cases</p>
            <button
              onClick={() => refetch()}
              className='mt-4 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600'
            >
              Try Again
            </button>
          </div>
        ) : isEmpty ? (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='No Data' className='mb-4 h-32 w-32' />
            <p className='text-xl text-white'>No cases found.</p>
          </div>
        ) : (
          <>
            <div className='rounded bg-gray-800 p-4'>
              <CaseTable
                cases={data?.results || []}
                isDarkMode={isDarkMode}
                ordering={ordering}
                setOrdering={setOrdering}
              />
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
              isDarkMode={isDarkMode}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Cases;