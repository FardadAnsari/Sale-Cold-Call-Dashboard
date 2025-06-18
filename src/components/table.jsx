import React from 'react';
import { useNavigate } from 'react-router-dom';

const Table = ({ shops = [], isDarkMode }) => {
  const navigate = useNavigate();

  const handleRowClick = (shop) => {
    navigate(`/shop/${shop.id}`);
  };

  // Show skeleton rows when no shops are available
  const skeletonRows = Array.from({ length: 5 }, (_, index) => {
    const rowBgClass = index % 2 === 0
      ? isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
      : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';

    return (
      <tr key={`skeleton-${index}`} className={`cursor-pointer ${rowBgClass}`}>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-4 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          <div className={`h-4 rounded w-1/5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></span>
            <div className={`h-3 rounded w-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </td>
      </tr>
    );
  });

  const skeletonMobile = Array.from({ length: 5 }, (_, index) => {
    const cardBgClass = index % 2 === 0
      ? isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
      : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';

    return (
      <div
        key={`skeleton-mobile-${index}`}
        className={`px-6 py-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer ${cardBgClass}`}
      >
        <div className="flex justify-between">
          <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            <div className={`h-5 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </h3>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></span>
            <div className={`h-3 rounded w-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        <p className="text-sm"><div className={`h-3 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
        <p className="text-sm"><div className={`h-3 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
        <p className="text-sm"><div className={`h-3 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
        <p className="text-sm"><div className={`h-3 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
      </div>
    );
  });

  if (!shops.length) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm border text-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
        }`}
      >
        <div className="bg-logo-pattern bg-cover bg-center h-40 w-full rounded-md flex items-center justify-center mb-4">
          <p className="bg-black/60 px-4 py-2 rounded text-white text-sm md:text-base">
            No shops found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const isOpen = status?.toLowerCase() === 'open';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isOpen
            ? isDarkMode
              ? 'bg-green-800 text-green-100'
              : 'bg-green-100 text-green-800'
            : isDarkMode
            ? 'bg-red-800 text-red-100'
            : 'bg-red-100 text-red-800'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isOpen
              ? isDarkMode
                ? 'bg-green-400'
                : 'bg-green-500'
              : isDarkMode
              ? 'bg-red-400'
              : 'bg-red-500'
          }`}
        />
        {status || 'Unknown'}
      </span>
    );
  };

  const formatWebsite = (url) => {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`; 
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={isDarkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}
      >
        Visit
      </a>
    );
  };

  return (
    <div
      className={`shadow-sm rounded-lg border overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div
        className={`px-6 py-4 border-b flex justify-between items-center ${
          isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'
        }`}
      >
        <h2 className="text-lg font-medium">Shop Directory</h2>
        <span className="text-sm">{shops.length} results</span>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto md:block hidden">
        <table
          className={`min-w-full divide-y ${
            isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}
        >
          <thead
            className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
          >
            <tr>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Shop Name
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Service Type
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Phone
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Postcode
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Website
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody
            className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}
          >
            {skeletonRows}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div
        className={`divide-y md:hidden ${
          isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-600'
        }`}
      >
        {skeletonMobile}
      </div>
    </div>
  );
};

export default Table;