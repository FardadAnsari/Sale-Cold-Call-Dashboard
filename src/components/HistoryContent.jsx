import React from 'react';
import { Link } from 'react-router-dom';

const HistoryContent = ({ historyItems }) => {
  if (!historyItems || historyItems.length === 0) {
    return null;
  }
console.log(historyItems);

  const formatCallDuration = (durationInMinutes) => {
    if (typeof durationInMinutes !== 'number' || isNaN(durationInMinutes)) {
      return '00:00';
    }
    const minutes = Math.floor(durationInMinutes);
    const seconds = Math.round((durationInMinutes - minutes) * 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) {
        throw new Error('Invalid date');
      }
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'N/A Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) {
        throw new Error('Invalid time');
      }
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return 'N/A Time';
    }
  };

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {historyItems.map((item, index) => (
        <div
          key={item.id || index}
          className='flex h-[243px] w-full flex-col justify-between rounded-lg bg-gray-800 p-6 shadow-lg'
        >
          <div>
            <h3 className='mb-4 text-xl font-semibold text-gray-100'>{item.name}</h3>
            <div className='space-y-2 text-sm text-gray-300'>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Call Duration:</span>
                <span>
                  {formatCallDuration(item.call_duration_minutes || Math.random() * 10 + 1)}
                </span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Result:</span>
                <span>{item.call_result || 'Interested'}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Date:</span>
                <span>{formatDate(item.call_date || '2025-06-02T17:30:00Z')}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Time:</span>
                <span>{formatTime(item.call_date || '2025-06-02T17:30:00Z')}</span>
              </p>
            </div>
          </div>
          <div className='mt-6 flex justify-center'>
            <Link
              className='w-[95%] rounded-lg border border-gray-600 bg-gray-800 py-2 text-sm text-center font-medium text-blue-400 hover:bg-gray-700 hover:text-blue-300'
              to={`/case/${item.sale_session}`}
            >
              Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryContent;
