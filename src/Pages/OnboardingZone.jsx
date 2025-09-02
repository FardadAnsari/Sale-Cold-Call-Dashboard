import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

import Table from '../components/Table';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { RestaurantIcon, CafeIcon, FilterIcon } from '../Icons';
import takeawayImg from '../images/takeaway.png';
import sadMaskImg from '../images/sad-mask.png';
import { API_BASE_URL } from 'src/api';
import ShopsFilter from '../components/ShopsFilter';

const OnboardingZone = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const authToken = sessionStorage.getItem('authToken');

  // --- INITIAL STATE FROM URL ---
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    postcode: searchParams.get('postcode') || '',
  }));
  const [ordering, setOrdering] = useState(() => {
    const s = searchParams.get('ordering');
    return s ? s.split(',') : [];
  });
  const [pendingFilters, setPendingFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    postcode: searchParams.get('postcode') || '',
  }));
  const [city, setCity] = useState(''); // (UI-only for ShopsFilter)
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    () => searchParams.get('q') || ''
  );

  const [showFilter, setShowFilter] = useState(false);
  const handleCancelFilter = () => setShowFilter(false);

  const isDarkMode = true;

  const categoryMapping = {
    takeaway: { label: 'Takeaway', category: 'takeaway' },
    restaurant: { label: 'Restaurant', category: 'restaurant' },
    cafe: { label: 'Café', category: 'cafe' },
  };
  const getCategoryLabel = (cat) =>
  cat ? (categoryMapping[cat]?.label ?? cat) : 'All';

  const orderedCategories = Object.keys(categoryMapping);

  const ORDER_LABELS = { rating: 'Rating', reviews: 'Reviews' };

  const formatOrdering = (orderingArray = []) =>
    orderingArray
      .map((token) => {
        const desc = token.startsWith('-');
        const field = desc ? token.slice(1) : token;
        const label = ORDER_LABELS[field] || field;
        return `${label} ${desc ? '↓' : '↑'}`; // ↓ for desc, ↑ for asc
      })
      .join(', ');

  // --- DEBOUNCE SEARCH INPUT ---
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 2000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  // --- KEEP URL IN SYNC ---
  useEffect(() => {
    const params = {
      category: filters.category || undefined,
      postcode: filters.postcode || undefined,
      ordering: ordering.length ? ordering.join(',') : undefined,
      page: currentPage > 1 ? String(currentPage) : undefined,
      q: debouncedSearchQuery || undefined,
    };
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    setSearchParams(cleaned, { replace: true });
  }, [filters, ordering, currentPage, debouncedSearchQuery, setSearchParams]);

  // --- DATA FETCH ---
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'shops',
      filters.category,
      filters.postcode,
      currentPage,
      debouncedSearchQuery,
      ordering,
    ],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/Shops`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          ...(filters.category ? { category: filters.category } : {}), // omit when All
          page: currentPage,
          search: debouncedSearchQuery || undefined,
          postcode: filters.postcode || undefined,
          ordering: ordering.length ? ordering.join(',') : undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const displayShops = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const isSearchMode = debouncedSearchQuery.length > 0;
  const isPageLoading = isLoading && data !== undefined;

  const handleCategoryClick = (category) => {
    setFilters((prev) => ({ ...prev, category }));
    setPendingFilters((prev) => ({ ...prev, category }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    const cleared = { category: '', postcode: '', city: '' };
    setCity('');
    setFilters(cleared);
    setPendingFilters(cleared);      
    setCurrentPage(1);
    refetch();
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'takeaway':
        return (
          <img src={takeawayImg} alt='Takeaway' className='h-10 w-11 rounded-full bg-transparent' />
        );
      case 'restaurant':
        return <RestaurantIcon />;
      case 'cafe':
        return <CafeIcon />;
      default:
        return null;
    }
  };

  // --- LOADING STATE ---
  if (isLoading && !data) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <main className='container mx-auto px-4 py-6'>
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
              {(filters.postcode || filters.category !== '' || city) && (
                <button
                  onClick={handleClearFilters}
                  className='ml-2 rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
                >
                  Clear Filters
                </button>
              )}
              <div className='relative inline-block text-left'>
                <button
                  onClick={() => setShowFilter(true)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${
                    isLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <FilterIcon fill={'white'} />
                  <span>Filter</span>
                </button>
                {showFilter && (
                  <div>
                    <div
                      className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                      onClick={handleCancelFilter}
                    ></div>
                    <div className='absolute right-0 z-50 mt-2'>
                      <ShopsFilter
                        isDarkMode={isDarkMode}
                        filters={pendingFilters}
                        setFilters={setPendingFilters}
                        city={city}
                        setCity={setCity}
                        onClose={handleCancelFilter}
                        onApply={() => {
                          setFilters(pendingFilters);
                          setCurrentPage(1);
                          refetch(); // optional; useQuery refetches via key changes
                          setShowFilter(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading shop data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <main className='container mx-auto px-4 py-6'>
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
              {(filters.postcode || filters.category !== '' || city) && (
                <button
                  onClick={handleClearFilters}
                  className='ml-2 rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
                >
                  Clear Filters
                </button>
              )}
              <div className='relative inline-block text-left'>
                <button
                  onClick={() => setShowFilter(true)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${
                    isLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <FilterIcon fill={'white'} />
                  <span>Filter</span>
                </button>
                {showFilter && (
                  <div>
                    <div
                      className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                      onClick={handleCancelFilter}
                    ></div>
                    <div className='absolute right-0 z-50 mt-2'>
                      <ShopsFilter
                        isDarkMode={isDarkMode}
                        filters={pendingFilters}
                        setFilters={setPendingFilters}
                        city={city}
                        setCity={setCity}
                        onClose={handleCancelFilter}
                        onApply={() => {
                          setFilters(pendingFilters);
                          setCurrentPage(1);
                          refetch(); // optional; useQuery refetches via key changes
                          setShowFilter(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p className='mb-2 text-2xl font-medium text-white'>Unable to load shop data.</p>
            <p className='mb-4 text-gray-400'>Error: {error.message}</p>
            <button
              onClick={refetch}
              className='rounded bg-orange-500 px-6 py-3 text-white hover:bg-orange-600'
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN ---
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
            {(filters.postcode || filters.category !== '' || city) && (
              <button
                onClick={handleClearFilters}
                className='ml-2 rounded border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600'
              >
                Clear Filters
              </button>
            )}
            <div className='relative inline-block text-left'>
              <button
                onClick={() => setShowFilter(true)}
                disabled={isLoading}
                className={`flex items-center gap-2 rounded border bg-gray-700 px-4 py-2 text-gray-200 transition-colors hover:bg-gray-600 ${
                  isLoading ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <FilterIcon fill={'white'} />
                <span>Filter</span>
              </button>
              {showFilter && (
                <div>
                  <div
                    className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
                    onClick={handleCancelFilter}
                  ></div>
                  <div className='absolute right-0 z-50 mt-2'>
                    <ShopsFilter
                      isDarkMode={isDarkMode}
                      filters={pendingFilters}
                      setFilters={setPendingFilters}
                      city={city}
                      setCity={setCity}
                      onClose={handleCancelFilter}
                      onApply={() => {
                        setFilters(pendingFilters);
                        setCurrentPage(1);
                        refetch(); // optional; useQuery refetches via key changes
                        setShowFilter(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isSearchMode && (
          <div className='mb-4'>
            <h2 className='mb-2 text-xl font-semibold text-gray-200'>
              Search Results for "{debouncedSearchQuery}" in {getCategoryLabel(filters.category)}
            </h2>
            <p className='text-sm text-gray-400'>
              {isLoading ? 'Searching...' : `Found ${displayShops.length} results`}
            </p>
          </div>
        )}

        {/* Active Filters Summary */}
        {(filters.category || filters.postcode || city || ordering.length > 0) && (
          <div className={`text-md px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span>Showing </span>
            <strong>{getCategoryLabel(filters.category)}</strong>
            <span> results</span>
            {(city || filters.postcode) && <span> for</span>}
            {filters.postcode && <strong> {filters.postcode}</strong>}
            {ordering?.length > 0 && (
              <>
                {' '}
                • Sorted by <strong>{formatOrdering(ordering)}</strong>
              </>
            )}
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

        {!isLoading && displayShops.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='No Results' className='mb-4 h-32 w-32' />
            <p className='text-center text-2xl font-medium text-white'>
              {isSearchMode
                ? `No results found for "${debouncedSearchQuery}" in ${getCategoryLabel(filters.category)}`
                : 'No shops found. Try another category or search term.'}
            </p>
          </div>
        ) : (
          <>
            <div className='space-y-8'>
              <div className='rounded-lg bg-gray-800 p-4'>
                <Table
                  shops={displayShops}
                  isDarkMode={isDarkMode}
                  ordering={ordering}
                  setOrdering={(o) => {
                    setOrdering(o);
                    setCurrentPage(1);
                  }}
                />
              </div>
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

export default OnboardingZone;
