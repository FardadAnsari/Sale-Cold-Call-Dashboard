import React from 'react';

const HistoryContent = ({ historyItems, onOpenCase }) => {
  if (!historyItems || historyItems.length === 0) {
    return null;
  }
  // console.log(historyItems);

  const limitDescription = (description, maxLength = 150) => {
    if (description && description.length > maxLength) {
      return description.substring(0, maxLength) + '...';
    }
    return description;
  };

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {historyItems.map((item, index) => (
        <div
          key={index}
          className='flex h-[243px] w-full flex-col justify-between rounded-lg bg-gray-800 p-4 shadow-lg'
        >
          <div className='flex-1'>
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
              <div className='flex flex-col gap-1'>
                <span className='font-medium text-gray-400'>Description:</span>
                <p className='break-words whitespace-pre-wrap text-gray-300'>
                  {limitDescription(item.description)}
                </p>
              </div>
            </div>
          </div>
          <div className='mt-4 flex justify-center'>
            <button
              onClick={() => onOpenCase(item)}
              className='w-[95%] rounded-lg border border-gray-600 bg-gray-800 py-2 text-center text-sm font-medium text-blue-400 hover:bg-gray-700 hover:text-blue-300'
            >
              Open Relevant Case
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryContent;
