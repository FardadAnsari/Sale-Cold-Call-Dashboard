import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Table from '../components/Table';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import { RestaurantIcon, CafeIcon } from '../Icons';
import takeawayImg from '../images/takeaway.png';
import sadMaskImg from '../images/sad-mask.png';
import { API_BASE_URL } from 'src/api';

const OnboardingZone = () => {
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem('authToken');

  const [filters, setFilters] = useState({ category: 'takeaway' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const isDarkMode = true;

  const categoryMapping = {
    takeaway: { label: 'Takeaway', category: 'takeaway' },
    restaurant: { label: 'Restaurant', category: 'restaurant' },
    cafe: { label: 'Café', category: 'cafe' },
  };
  const orderedCategories = Object.keys(categoryMapping);

  // Debounce
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shops', filters.category, currentPage, debouncedSearchQuery],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/Shops`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          category: filters.category,
          page: currentPage,
          search: debouncedSearchQuery || undefined,
        },
      });
      console.log(res);
      
      return res.data; // { results, totalPages, currentPage }
    },
    keepPreviousData: true,
  });

  const displayShops = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const isSearchMode = debouncedSearchQuery.length > 0;
  const isPageLoading = isLoading && data !== undefined;

  const handleCategoryClick = (category) => {
    setFilters({ category });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowClick = (shopId) => {
    navigate(`/shop/${shopId}`);
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

  //Loading state
  if (isLoading && !data) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <header className='bg-gray-900 shadow-sm'>
          <div className='flex rounded-b-2xl bg-gray-700 px-3 py-4'>
            {orderedCategories.map((category) => (
              <button
                key={category}
                disabled
                className='flex flex-1 items-center justify-center gap-2 py-4 text-lg text-gray-400 opacity-50'
              >
                {getIconForCategory(category)}
                <span>{categoryMapping[category].label}</span>
              </button>
            ))}
          </div>
        </header>
        <main className='container mx-auto p-4'>
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

  //Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-900 text-white'>
        <header className='bg-gray-900 shadow-sm'>
          <div className='flex rounded-b-2xl bg-gray-700 px-3 py-4'>
            {orderedCategories.map((category) => (
              <button
                key={category}
                disabled
                className='flex flex-1 items-center justify-center gap-2 py-4 text-lg text-gray-400 opacity-50'
              >
                {getIconForCategory(category)}
                <span>{categoryMapping[category].label}</span>
              </button>
            ))}
          </div>
        </header>
        <main className='container mx-auto p-4'>
          <div className='mt-20 flex flex-col items-center justify-center'>
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

  // Main content
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <header className='bg-gray-900 shadow-sm'>
        <div className='flex rounded-b-2xl bg-gray-700 px-3 py-4'>
          {orderedCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              disabled={isLoading}
              className={`flex flex-1 items-center justify-center gap-2 py-4 text-lg transition-all ${filters.category === category ? 'scale-95 rounded-lg bg-gray-600 text-gray-200' : 'bg-gray-700 text-gray-400'} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {getIconForCategory(category)}
              <span>{categoryMapping[category].label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className='container mx-auto space-y-6 p-4'>
        <div className='mt-5 flex items-center justify-between pb-4'>
          <div className='max-w-md flex-grow md:max-w-xl lg:max-w-2xl'>
            <Search
              searchTerm={searchInput}
              setSearchTerm={setSearchInput}
              isDarkMode={isDarkMode}
              isLoading={isLoading}
            />
          </div>
        </div>

        {isSearchMode && (
          <div className='mb-4'>
            <h2 className='mb-2 text-xl font-semibold text-gray-200'>
              Search Results for "{debouncedSearchQuery}" in{' '}
              {categoryMapping[filters.category].label}
            </h2>
            <p className='text-sm text-gray-400'>
              {isLoading ? 'Searching...' : `Found ${displayShops.length} results`}
            </p>
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
                ? `No results found for "${debouncedSearchQuery}" in ${categoryMapping[filters.category].label}`
                : 'No shops found. Try another category or search term.'}
            </p>
          </div>
        ) : (
          <>
            <div className='space-y-8'>
              <div className='rounded-lg bg-gray-800 p-4'>
                <Table shops={displayShops} isDarkMode={isDarkMode} onRowClick={handleRowClick} />
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
