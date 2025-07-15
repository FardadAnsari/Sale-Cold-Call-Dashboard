import React from 'react';
// Removed useNavigate as we are handling navigation/modal display in parent
import { OpenIcon, ClosedIcon } from '../Icons';

const LeadsTable = ({ shops = [], isDarkMode, onRowClick }) => {
  // Added onRowClick prop

  const skeletonRows = Array.from({ length: 5 }, (_, index) => {
    const rowBgClass =
      index % 2 === 0
        ? isDarkMode
          ? 'bg-gray-700/30'
          : 'bg-gray-50'
        : isDarkMode
          ? 'bg-gray-700/50'
          : 'bg-gray-100';
    return (
      <tr key={`skeleton-${index}`} className={`cursor-pointer ${rowBgClass}`}>
        <td
          className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
        >
          <div className={`h-6 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td
          className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
        >
          <div className={`h-6 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td
          className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
        >
          <div className={`h-6 w-1/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td
          className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
        >
          <div className={`h-6 w-1/5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td
          className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
        >
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            <span
              className={`mr-1.5 h-3.5 w-3.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            ></span>
            <div className={`h-4 w-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </td>
      </tr>
    );
  });

  const skeletonMobile = Array.from({ length: 5 }, (_, index) => {
    const cardBgClass =
      index % 2 === 0
        ? isDarkMode
          ? 'bg-gray-700/30'
          : 'bg-gray-50'
        : isDarkMode
          ? 'bg-gray-700/50'
          : 'bg-gray-100';
    return (
      <div
        key={`skeleton-mobile-${index}`}
        className={`space-y-3 px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer ${cardBgClass}`}
      >
        <div className='flex items-center justify-between'>
          <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            <div
              className={`h-6 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            ></div>
          </h3>
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            <span
              className={`mr-1.5 h-3.5 w-3.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            ></span>
            <div className={`h-4 w-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
        <p className='text-sm'>
          <div className={`h-4 w-1/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </p>
        <p className='text-sm'>
          <div className={`h-4 w-1/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </p>
        <p className='text-sm'>
          <div className={`h-4 w-1/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </p>
      </div>
    );
  });

  if (!shops.length) {
    return (
      <div
        className={`rounded-lg border p-6 text-center shadow-sm ${
          isDarkMode
            ? 'border-gray-700 bg-gray-800 text-gray-400'
            : 'border-gray-200 bg-white text-gray-500'
        }`}
      >
        <div className='bg-logo-pattern mb-4 flex h-40 w-full items-center justify-center rounded-md bg-cover bg-center'>
          <p className='rounded bg-black/60 px-4 py-2 text-sm text-white md:text-base'>
            No shops found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const isOpen = status?.toLowerCase() === 'open';
    return (
      <span className='inline-flex items-center'>{isOpen ? <OpenIcon /> : <ClosedIcon />}</span>
    );
  };

  const formatWebsite = (url) => {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    const handleClick = (e) => {
      e.stopPropagation();
      window.open(fullUrl, '_blank');
    };

    return (
      <a
        href='#'
        onClick={handleClick}
        className={isDarkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}
      >
        Visit
      </a>
    );
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border shadow-sm ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Desktop Table */}
      <div className='hidden overflow-x-auto md:block'>
        <table
          className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}
        >
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th
                scope='col'
                className={`text-l px-6 py-6 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Shop Name
              </th>
              <th
                scope='col'
                className={`text-l px-6 py-3 text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Create Time
              </th>
              <th
                scope='col'
                className={`text-l px-6 py-3 text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Created by
              </th>
              <th
                scope='col'
                className={`text-l px-6 py-3 text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                State
              </th>
              <th
                scope='col'
                className={`text-l px-6 py-3 text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Lead Status
              </th>
            </tr>
          </thead>
          <tbody
            className={
              isDarkMode
                ? 'divide-y divide-gray-700 bg-gray-800'
                : 'divide-y divide-gray-200 bg-white'
            }
          >
            {shops.map((shop, index) => (
              <tr
                key={shop.id}
                onClick={() => onRowClick(shop.id)}
                className={`cursor-pointer ${index % 2 === 0 ? (isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50') : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
              >
                <td
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                >
                  {shop.shopName}
                </td>
                <td
                  className={`px-6 py-4 text-right text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <p className='text-sm'>{shop.createdTime}</p>
                </td>
                <td
                  className={`px-6 py-4 text-right text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <p className='text-sm'>{shop.createdBy}</p>
                </td>
                <td
                  className={`px-6 py-4 text-right text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <div className='text-right'>{shop.state}</div>
                </td>
                <td
                  className={`px-6 py-4 text-right whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <div className='text-right'>{shop.leadStatus}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div
        className={`divide-y md:hidden ${isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-600'}`}
      >
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onRowClick(shop.id)}
            className={`space-y-3 px-6 py-4 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}
          >
            <div className='flex items-center justify-between'>
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {shop.shopName}
              </h3>
            </div>
            <div className='flex justify-between'>
              <p className='text-sm'>{shop.createdTime}</p>
              <p className='text-sm'>{shop.createdBy}</p>
            </div>
            <div className='text-right'>{shop.state}</div>
            <div className='text-right'>{shop.leadStatus}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsTable;