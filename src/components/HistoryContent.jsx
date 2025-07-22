import React from 'react';
import { Link } from 'react-router-dom';

const HistoryContent = ({ historyItems }) => {
  if (!historyItems || historyItems.length === 0) {
    return null;
  }
console.log(historyItems);

  const limitDescription = (description, maxLength = 150) => {
    if (description && description.length > maxLength) {
      return description.substring(0, maxLength) + '...'; // Add ellipsis if it's too long
    }
    return description;
  };

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {historyItems.map((item, index) => (
        <div
          key={item.id || index}
          className='flex h-[243px] w-full flex-col justify-between rounded-lg bg-gray-800 p-4 shadow-lg'
        >
          <div>
            <h3 className='text-xl font-semibold text-gray-100'>{item.name}</h3>
            <div className='space-y-2 text-sm text-gray-300'>
              <p className='flex justify-between'>
                <span className='text-xl font-medium text-gray-300'>{item.shop_name}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Result:</span>
                <span>{item.stage}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Date:</span>
                <span>{item.date}</span>
              </p>
              <p className='flex flex-col gap-1'>
                <span className='font-medium text-gray-400'>Description: </span>
                <p>{limitDescription(item.description)}</p>
              </p>
            </div>
          </div>
          <div className='mt-6 flex justify-center'>
            <Link
              className='w-[95%] rounded-lg border border-gray-600 bg-gray-800 py-2 text-center text-sm font-medium text-blue-400 hover:bg-gray-700 hover:text-blue-300'
              to={`/case/${item.sale_session_id}`}
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
