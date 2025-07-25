import React from 'react';


const LeadsTable = ({ shops = [], isDarkMode, onRowClick }) => {

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