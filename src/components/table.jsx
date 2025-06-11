

import React from 'react';

const Table = ({ shops = [], isDarkMode }) => {
  if (!shops.length) {
    return (
      <div className={`p-6 rounded-lg shadow-sm border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
        <p>No shops found. Try adjusting your filters.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const isOpen = status?.toLowerCase() === 'open';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
        {status || 'Unknown'}
      </span>
    );
  };

  const formatWebsite = (url) => {
    if (!url) return null;
    const fullUrl = url.startsWith('http') ? url : `https://${url}`; 
    return (
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
        Visit
      </a>
    );
  };

  return (
    <div className={`shadow-sm rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className={`px-6 py-4 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-900'}`}>
        <h2 className="text-lg font-medium">Shop Directory</h2>
        <span className="text-sm">{shops.length} results</span>
      </div>
      <div className="overflow-x-auto md:block hidden">
        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Shop Name</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Service Type</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Phone</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Postcode</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Website</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
            </tr>
          </thead>
          <tbody className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
            {shops.map((shop) => (
              <tr key={shop.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{shop.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {shop.serviceType}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{shop.phone}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{shop.postcode}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{formatWebsite(shop.website)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(shop.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`divide-y md:hidden ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {shops.map((shop) => (
          <div key={shop.id} className={`px-6 py-4 space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <div className="flex justify-between">
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{shop.name}</h3>
              {getStatusBadge(shop.status)}
            </div>
            <p className="text-sm">Type: {shop.serviceType}</p>
            <p className="text-sm">Phone: {shop.phone}</p>
            <p className="text-sm">Postcode: {shop.postcode}</p>
            <p className="text-sm">Website: {formatWebsite(shop.website) || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;