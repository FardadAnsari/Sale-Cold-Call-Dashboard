const Search = ({ searchTerm, setSearchTerm, isDarkMode }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className='mx-auto w-full max-w-md md:mx-0'>
      <div className='relative w-full'>
        <input
          id='search'
          type='text'
          value={searchTerm}
          onChange={handleChange}
          placeholder='Search'
          className={`w-full rounded-lg py-3 pr-10 pl-10 focus:ring-2 focus:ring-blue-500 ${
            isDarkMode
              ? 'bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-400'
              : 'bg-gray-100 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
          }`}
          style={{ outline: 'none', boxShadow: 'none' }}
        />
        <svg
          className={`absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
        {searchTerm && (
          <button
            onClick={handleClear}
            className={`absolute top-1/2 right-3 -translate-y-1/2 transform ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
