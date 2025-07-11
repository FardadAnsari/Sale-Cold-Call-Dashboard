import React from 'react';

const CaseTable = ({ cases = [], isDarkMode, onRowClick }) => {
  const skeletonRows = Array.from({ length: 5 }, (_, index) => {
    const rowBgClass = index % 2 === 0
      ? isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
      : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100';
    return (
      <tr key={`skeleton-${index}`} className={`cursor-pointer ${rowBgClass}`}>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          <div className={`h-6 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-6 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-6 rounded w-1/5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-6 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
          <div className={`h-6 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
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
        className={`px-6 py-4 space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} cursor-pointer ${cardBgClass}`}
      >
        <div className="flex justify-between items-center">
          <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            <div className={`h-6 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </h3>
          <div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
        <p className="text-sm"><div className={`h-4 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
        <p className="text-sm"><div className={`h-4 rounded w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div></p>
      </div>
    );
  });

  if (!cases.length) {
    return (
      <div
        className={`p-6 rounded-lg shadow-sm border text-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
        }`}
      >
        <div className="bg-logo-pattern bg-cover bg-center h-40 w-full rounded-md flex items-center justify-center mb-4">
          <p className="bg-black/60 px-4 py-2 rounded text-white text-sm md:text-base">
            No cases found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  // Helper to format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month} / ${year}-${hours}:${minutes}`;
    } catch (e) {
      console.error("Error parsing date:", isoString, e);
      return 'Invalid Date';
    }
  };

  return (
    <div className={`shadow-sm rounded-lg border overflow-hidden ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>

      {/* Desktop Table */}
      <div className="overflow-x-auto md:block hidden">
        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th scope="col" className={`px-6 py-6 text-left text-l font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Shop Name</th>
              <th scope="col" className={`px-6 py-3 text-left text-l font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Start Time</th>
              <th scope="col" className={`px-6 py-3 text-left text-l font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Case Stage</th>
              <th scope="col" className={`px-6 py-3 text-left text-l font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Created By</th>
              <th scope="col" className={`px-6 py-3 text-left text-l font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Update Time</th>
            </tr>
          </thead>
          <tbody className={isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
            {cases.map((caseItem, index) => (
              <tr key={caseItem.id} onClick={() => onRowClick(caseItem.id)} className={`cursor-pointer ${index % 2 === 0 ? isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50' : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{caseItem.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatDateTime(caseItem.start_time)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{caseItem.case_stage}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{caseItem.created_by}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{formatDateTime(caseItem.last_update)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className={`divide-y md:hidden ${isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-600'}`}>
        {cases.map((caseItem) => (
          <div key={caseItem.id} onClick={() => onRowClick(caseItem.id)} className={`px-6 py-4 space-y-3 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center">
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{caseItem.name}</h3>
              <p className="text-sm">{formatDateTime(caseItem.start_time)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">{caseItem.case_stage}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Created By: {caseItem.created_by}</p>
              <p className="text-sm">Updated: {formatDateTime(caseItem.last_update)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseTable;