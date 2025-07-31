import { useState, useEffect, useRef } from 'react';
import Search from '../components/Search';
import sadMaskImg from '../images/sad-mask.png';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import UserHistoryContent from '../components/UserHistoryContent';

const UsersHistories = () => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
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
    queryClient.invalidateQueries(['usersHistory']);
  }, [ queryClient]);

  const authToken = sessionStorage.getItem('authToken');

  const {
    data: usersHistory,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['usersHistory', debouncedSearchQuery],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/user/history-users/`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          search: debouncedSearchQuery || undefined,
        },
      });
      console.log(res);

      return res.data;
    },
  });

  const isInitialLoading = isLoading && !usersHistory;
  const overallLoading = isInitialLoading || isFetching;
  const isSearchMode = debouncedSearchQuery.length > 0;

  const filteredResults = isSearchMode
    ? usersHistory?.filter((item) => {
        const search = debouncedSearchQuery.toLowerCase();
        return (item?.name?.toLowerCase().includes(search)||
        item?.username?.toLowerCase().includes(search) ||
          item?.email?.toLowerCase().includes(search))
      })
    : usersHistory;

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
        </div>

        {isInitialLoading && (
          <div className='mt-20 flex items-center justify-center'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading users histories data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p className='mb-4 text-center text-2xl font-medium text-white'>
              Unable to load users histories data.
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
              No users histories found. Please try different filters.
            </p>
          </div>
        )}

        {!overallLoading && !error && filteredResults?.length > 0 && (
          <>
            <div className='space-y-8'>
              <UserHistoryContent usersHistory={filteredResults} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UsersHistories;
