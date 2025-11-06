const ActivityHistory = ({ caseDetails, isDarkMode, isDrawer = false }) => {
  const history = caseDetails?.history || [];

  return (
    <div
      className={`flex-1 rounded-lg bg-gray-700 shadow-md flex h-full flex-col`}
    >
      <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
        <h2
          className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
        >
          Activity History
        </h2>

        {history.length > 0 ? (
          <div className='space-y-4'>
            {history.map((item) => (
              <div key={item.history_id} className='rounded-lg bg-gray-800 p-4'>
                <div className='mb-2 flex items-start justify-between'>
                  <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {item.date}
                  </p>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.call_time}
                  </span>
                </div>
                <p className={`mb-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Description:</strong> {item.description || 'No description provided.'}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>User:</strong> {item.user_name || 'Unknown User'}
                </p>
                {item.stage && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Stage:</strong> {item.stage}
                  </p>
                )}
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
