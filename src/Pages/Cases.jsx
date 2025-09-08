import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import Search from '../components/Search';
import CaseTable from '../components/CaseTable'; // or DataTable if you swapped already
import Pagination from '../components/Pagination';
import sadMaskImg from '../images/sad-mask.png';
import { API_BASE_URL } from 'src/api';
import { FilterIcon } from '../Icons';
import DateFilter from '../components/DateFilter';
import { BsCalendar2Date } from 'react-icons/bs';
import ShopsFilter from '@components/ShopsFilter';

const Cases = () => {
  const authToken = sessionStorage.getItem('authToken');

  // --- URL search params (sync like OnboardingZone) ---
  const [searchParams, setSearchParams] = useSearchParams();

  const initialOrdering = (() => {
    const s = searchParams.get('ordering');
    return s ? s.split(',') : [];
  })();
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPostcode = searchParams.get('postcode') || '';
  const initialDateStr = searchParams.get('date'); // YYYY-MM-DD
  const initialSelectedDate = initialDateStr ? new Date(initialDateStr) : null;

  // --- search / page ---
  const [searchInput, setSearchInput] = useState(initialQ);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialQ);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // --- filters in effect (used by query) ---
  const [filters, setFilters] = useState({
    selectedDate: initialSelectedDate,
    category: initialCategory,
    postcode: initialPostcode,
    city: '', // UI-only; not sent to API nor URL
  });

  // --- pending filters in the popover before Apply ---
  const [pendingFilters, setPendingFilters] = useState({
    category: initialCategory,
    postcode: initialPostcode,
    city: '',
  });

  const [city, setCity] = useState('');
  const [ordering, setOrdering] = useState(initialOrdering);

  // --- popovers ---
  const [showFilter, setShowFilter] = useState(false);
  const handleCancelFilter = () => setShowFilter(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isDarkMode = true;

  // --- summary helpers (labels + formatting) ---
  const categoryMapping = {
    takeaway: { label: 'Takeaway' },
    restaurant: { label: 'Restaurant' },
    cafe: { label: 'Café' },
  };
  const getCategoryLabel = (cat) => (cat ? (categoryMapping[cat]?.label ?? cat) : 'All');

  // map your ordering fields to human labels
  const ORDER_LABELS = {
    session_start_date: 'Start Time',
    last_update: 'Update Time',
    stage: 'Stage',
    id: 'ID',
  };

  const formatOrdering = (orderingArray = []) =>
    orderingArray
      .map((token) => {
        const desc = token.startsWith('-');
        const field = desc ? token.slice(1) : token;
        const label = ORDER_LABELS[field] || field;
        return `${label} ${desc ? '↓' : '↑'}`;
      })
      .join(', ');

  const formatDateNice = (d) =>
    d
      ? new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(d)
      : '';

  // --- debounce search ---
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 2000);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchInput]);

  // Reset search + page when date changes
  useEffect(() => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    setCurrentPage(1);
  }, [filters.selectedDate]);

  // Keep pending state in sync when filter popover opens (optional QoL)
  useEffect(() => {
    if (showFilter) {
      setPendingFilters({
        category: filters.category || '',
        postcode: filters.postcode || '',
        city: city || filters.city || '',
      });
    }
  }, [showFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const formattedDate = filters.selectedDate
    ? new Intl.DateTimeFormat('en-CA').format(filters.selectedDate)
    : undefined;

  // --- KEEP URL IN SYNC (like OnboardingZone) ---
  useEffect(() => {
    const params = {
      q: debouncedSearchQuery || undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
      category: filters.category || undefined,
      postcode: filters.postcode || undefined,
      ordering: ordering.length ? ordering.join(',') : undefined,
      date: filters.selectedDate
        ? new Intl.DateTimeFormat('en-CA').format(filters.selectedDate)
        : undefined,
    };
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    setSearchParams(cleaned, { replace: true });
  }, [
    debouncedSearchQuery,
    currentPage,
    filters.category,
    filters.postcode,
    filters.selectedDate,
    ordering,
    setSearchParams,
  ]);

  // --- DATA FETCH ---
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [
      'sale-sessions',
      debouncedSearchQuery,
      currentPage,
      formattedDate,
      ordering,
      filters.category,
      filters.postcode,
    ],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/history/sale-sessions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          search: debouncedSearchQuery || undefined,
          page: currentPage,
          start_time: formattedDate || undefined, // API expects start_time
          ordering: ordering.length ? ordering.join(',') : undefined,
          ...(filters.category ? { category: filters.category } : {}),
          ...(filters.postcode ? { postcode: filters.postcode } : {}),
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
    setCurrentPage(1);
  };

  const handleCancelDateFilter = () => setShowDatePicker(false);

  const handleClearFilters = () => {
    setFilters({
      selectedDate: null,
      category: '',
      postcode: '',
      city: '',
    });
    setCity('');
    setPendingFilters({ category: '', postcode: '', city: '' });
    setCurrentPage(1);
    setSearchInput('');
    setDebouncedSearchQuery('');
    setOrdering([]);
    setSearchParams({}, { replace: true }); // clear URL too
    refetch(); // optional
  };

  const hasAnyFilter =
    !!filters.selectedDate || !!filters.postcode || filters.category !== '' || !!city;

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
            {hasAnyFilter && (
              <button
                onClick={handleClearFilters}
                className='ml-2 rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
              >
                Clear Filters
              </button>
            )}

            <div className='relative inline-block text-left'>
              <div className='flex gap-2'>
                <button
                  onClick={() => setShowDatePicker(true)}
                  disabled={overallLoading}
                  className={`flex items-center gap-2 rounded border bg-gray-700 p-2 text-gray-200 transition-colors hover:bg-gray-600 ${
                    overallLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <BsCalendar2Date size={25} fill={'white'} />
                </button>

                <button
                  onClick={() => setShowFilter(true)}
                  disabled={overallLoading}
                  className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${
                    overallLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <FilterIcon fill={'white'} />
                  <span>Filter</span>
                </button>
              </div>

              {showDatePicker && (
                <>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelDateFilter}
                  />
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

              {showFilter && (
                <div>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelFilter}
                  />
                  <div className='absolute right-0 z-50 mt-2'>
                    <ShopsFilter
                      isDarkMode={isDarkMode}
                      filters={pendingFilters}
                      setFilters={setPendingFilters}
                      city={city}
                      setCity={setCity}
                      onClose={handleCancelFilter}
                      onApply={() => {
                        setFilters((prev) => ({
                          ...prev,
                          category: pendingFilters.category || '',
                          postcode: pendingFilters.postcode || '',
                          city: city || pendingFilters.city || '',
                        }));
                        setCurrentPage(1);
                        setShowFilter(false);
                        refetch(); // optional
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Active Filters Summary */}
        {(filters.category ||
          filters.postcode ||
          city ||
          filters.selectedDate ||
          ordering.length > 0) && (
          <div className={`text-md px-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>Showing </span>
            <strong>{getCategoryLabel(filters.category)}</strong>
            <span> cases</span>
            {(city || filters.postcode) && <span> for</span>}
            {city && <strong> {city}</strong>}
            {filters.postcode && <strong> {filters.postcode}</strong>}
            {filters.selectedDate && (
              <>
                {' '}
                on <strong>{formatDateNice(filters.selectedDate)}</strong>
              </>
            )}
            {ordering.length > 0 && (
              <>
                {' '}
                • Sorted by <strong>{formatOrdering(ordering)}</strong>
              </>
            )}
          </div>
        )}

        {isLoading ? (
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500' />
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
                setOrdering={(o) => {
                  setOrdering(o);
                  setCurrentPage(1);
                }}
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