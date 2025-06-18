import React from 'react';

const CallHistory = ({ calls, isDarkMode }) => {
  if (!calls.length) {
    return <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No call history available.</p>;
  }

  return (
    <ul className="space-y-3">
      {calls.map((call) => (
        <li key={call.id} className={`p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white shadow'}`}>
          <p className="text-sm font-medium">Called by: {call.caller}</p>
          <p className="text-xs opacity-80">{call.timestamp}</p>
          <p className="text-xs mt-1">Result: {call.result}</p>
        </li>
      ))}
    </ul>
  );
};

export default CallHistory;