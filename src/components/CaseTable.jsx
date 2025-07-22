import { useNavigate } from 'react-router-dom'; // Import useNavigate for row click navigation

const CaseTable = ({ cases = [], isDarkMode}) => {
  const navigate = useNavigate(); // Initialize navigate

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



  const handleRowClick = (caseId) => {
    navigate(`/case/${caseId}`);
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
                className={`text-l px-6 py-3 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Start Time
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
                scope='col'
                className={`text-l px-6 py-3 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
              >
                Update Time
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
                  className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  {caseItem.session_start_date}
                </td>
                <td
                  className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  {caseItem.stage}
                </td>
                <td
                  className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  {caseItem.created_by}
                </td>
                <td
                  className={`px-6 py-4 text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
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
            key={caseItem.id}
            onClick={() => handleRowClick(caseItem.id)}
            className={`space-y-3 px-6 py-4 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}
          >
            <div className='flex items-center justify-between'>
              <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {caseItem.name}
              </h3>
              <p className='text-sm'>{caseItem.session_start_date}</p>
            </div>
            <div className='flex justify-between'>
              <p className='text-sm'>{caseItem.case_stage}</p>
            </div>
            <div className='flex justify-between'>
              <p className='text-sm'>Created By: {caseItem.created_by}</p>
              <p className='text-sm'>Updated: {caseItem.last_update}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseTable;