const ActivityHistory = ({ caseDetails, isDarkMode, isDrawer = false }) => {
  const history = caseDetails?.history || [];
  // console.log(history);

  return (
    <div className='flex h-full flex-1 flex-col'>
      <div className='custom-scrollbar flex-1 overflow-y-auto'>
        <h2
          className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
        >
          Activity History
        </h2>

        {history.length > 0 ? (
          <div className='space-y-4'>
            {history.map((item) => (
              <div key={item.history_id} className='rounded-lg bg-gray-700 p-4'>
                <div className='mb-2 flex items-start justify-between'>
                  <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {item.date}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Stage: {item.stage}
                  </p>
                </div>

                {/* Description as paragraph */}
                <div className='mb-3'>
                  <strong
                    className={`mb-1 block text-md ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Description:
                  </strong>
                  <p
                    className={`text-sm break-words whitespace-pre-wrap ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className='flex flex-wrap gap-4'>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    User: {item.user_name || 'Unknown User'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-40 flex-col items-center justify-center'>
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No activity history recorded for this case.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
