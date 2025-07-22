import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Search from '../components/Search';
import CaseTable from '../components/CaseTable';
import Pagination from '../components/Pagination';
import sadMaskImg from '../images/sad-mask.png';
import { API_BASE_URL } from 'src/api';

const Cases = () => {
  const authToken = sessionStorage.getItem('authToken');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isDarkMode = true;

  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sale-sessions', debouncedSearchQuery, currentPage],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/history/sale-sessions`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: {
          search: debouncedSearchQuery || undefined,
          page: currentPage,
        },
      });
      console.log(res);
      
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isEmpty = !isLoading && data?.results?.length === 0;

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <main className='container mx-auto space-y-6 px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Search
            searchTerm={searchInput}
            setSearchTerm={setSearchInput}
            isDarkMode={isDarkMode}
            isLoading={isLoading}
          />
        </div>

        {isLoading ? (
          <div className='flex justify-center py-16'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-gray-300'>Loading sessions...</p>
            </div>
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center justify-center p-8'>
            <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
            <p className='text-xl text-white'>Failed to load sessions</p>
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
            <p className='text-xl text-white'>No sessions found.</p>
          </div>
        ) : (
          <>
            <div className='rounded bg-gray-800 p-4'>
              <CaseTable cases={data?.results || []} isDarkMode={isDarkMode} />
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