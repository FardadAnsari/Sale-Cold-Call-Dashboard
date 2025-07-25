// AppContainer.jsx
import React, { useState } from 'react';
import CallHistory from './CallHistory'; // Adjust path as needed
import Lead from './CreateLead';             // Adjust path as needed

const AppContainer = () => {
  const [activeTab, setActiveTab] = useState('callSummary'); // 'callSummary' or 'createLead'
  const isDarkMode = true; // You can make this dynamic if needed

  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 text-white min-h-screen' : 'bg-gray-100 text-gray-900 min-h-screen'}`}>
      <div className="flex mb-4"> {/* Removed border-b to match tab image styling better below */}
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none ${
            activeTab === 'callSummary'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => setActiveTab('callSummary')}
        >
          Call Summary
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none ${
            activeTab === 'createLead'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => setActiveTab('createLead')}
        >
          Create Lead
        </button>
      </div>

      {/* This is the main card container where content will switch */}
      <div className={`bg-gray-700 rounded-lg shadow-md p-4 flex flex-col h-[calc(100vh-120px)] relative`}>
        {activeTab === 'callSummary' && <CallHistory isDarkMode={isDarkMode} />}
        {activeTab === 'createLead' && <Lead isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

export default AppContainer;