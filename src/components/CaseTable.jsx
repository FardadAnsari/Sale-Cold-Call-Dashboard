import { TbSortAscending, TbSortDescending } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for row click navigation

const CaseTable = ({ cases = [], isDarkMode, ordering = [], setOrdering }) => {
  const navigate = useNavigate();
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

  const handleRowClick = (caseId) => {
    navigate(`/cases/${caseId}`);
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
            <tr className='cursor-pointer'>
              <th
                scope='col'
                className={`text-l px-6 py-6 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Shop Name
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
                onClick={() => handleRowClick(caseItem.sale_session_id)}
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

      {/* Mobile View */}
      <div
        className={`divide-y md:hidden ${isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-600'}`}
      >
        {cases.map((caseItem) => (
          <div
            key={caseItem.sale_session_id}
            onClick={() => handleRowClick(caseItem.sale_session_id)}
            className={`flex space-y-3 px-6 py-4 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}
          >
            <div className='flex items-center justify-between'>
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {caseItem.shop}
              </h3>
            </div>

            <div className='flex flex-col justify-between'>
              <p className='text-sm'>Stage: {caseItem.stage}</p>
              <p className='text-sm'>Created By: {caseItem.created_by}</p>
              <p className='text-sm'>Start Date: {caseItem.session_start_date}</p>
              <p className='text-sm'>Updated: {caseItem.last_update}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseTable;