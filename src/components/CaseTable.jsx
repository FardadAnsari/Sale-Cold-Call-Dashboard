import { useState } from 'react';
import { TbSortAscending, TbSortDescending } from 'react-icons/tb';
import CaseDrawer from './CaseDrawer';

const CaseTable = ({ cases = [], isDarkMode, ordering = [], setOrdering }) => {
  
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSort = (field) => {
    let newOrdering = [...ordering];
    const ascIndex = newOrdering.indexOf(field);
    const descIndex = newOrdering.indexOf(`-${field}`);

    if (ascIndex !== -1) {
      newOrdering[ascIndex] = `-${field}`;
    } else if (descIndex !== -1) {
      newOrdering.splice(descIndex, 1);
    } else {
      newOrdering.push(field);
    }
    setOrdering(newOrdering);
  };

  const handleRowClick = (caseItem) => {
    setSelectedCase(caseItem);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCase(null);
  };

  if (!cases.length) {
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
            No cases found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <tr className='cursor-pointer'>
                <th
                  scope='col'
                  className={`text-l px-6 py-6 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Shop Name
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-center font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Postcode
                </th>
                <th
                  onClick={() => handleSort('session_start_date')}
                  scope='col'
                  className={`px-6 py-3 text-center text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <div className='flex items-center justify-center'>
                    Start Time
                    {ordering.includes('session_start_date') && <TbSortAscending />}
                    {ordering.includes(`-session_start_date`) && <TbSortDescending />}
                  </div>
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Case Stage
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Created By
                </th>
                <th
                  onClick={() => handleSort('last_update')}
                  scope='col'
                  className={`px-6 py-3 text-center text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <div className='flex items-center justify-center'>
                    <span> Update Time</span>
                    {ordering.includes('last_update') && <TbSortAscending />}
                    {ordering.includes(`-last_update`) && <TbSortDescending />}
                  </div>
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
              {cases.map((caseItem, index) => (
                <tr
                  key={caseItem.sale_session_id}
                  onClick={() => handleRowClick(caseItem)}
                  className={`cursor-pointer ${index % 2 === 0 ? (isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50') : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                >
                  <td
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    {caseItem.shop}
                  </td>
                  <td
                    className={`px-6 py-4 text-center text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {caseItem.postcode}
                  </td>
                  <td
                    className={`px-6 py-4 text-center text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {caseItem.session_start_date}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {caseItem.stage}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {caseItem.created_by}
                  </td>
                  <td
                    className={`px-6 py-4 text-center text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {caseItem.last_update}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Drawer */}
      <CaseDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        isDarkMode={isDarkMode}
        caseData={selectedCase} // Pass case data instead of shop
        mode='case' // Add mode to distinguish between shop and case
      />
    </>
  );
};

export default CaseTable;