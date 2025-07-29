import React from 'react';
import { Link } from 'react-router-dom';

const UserHistoryContent = ({ usersHistory }) => {
  if (!usersHistory || usersHistory.length === 0) {
    return null;
  }
console.log(usersHistory);


  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      {usersHistory.map((item, index) => (
        <div
          key={item.id || index}
          className='flex h-full w-full flex-col justify-between rounded-lg bg-gray-800 p-4 shadow-lg'
        >
          <div className='mb-4'>
            <div className='space-y-2 text-md text-gray-300'>
              <p className='flex justify-between'>
                <span className='text-xl font-medium text-gray-300'>{item.name}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Username:</span>
                <span>{item.username}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Email:</span>
                <span>{item.email}</span>
              </p>
              <p className='flex justify-between'>
                <span className='font-medium text-gray-400'>Number of calls:</span>
                <span>{item.call_count}</span>
              </p>
            </div>
          </div>
          <div className='flex justify-center'>
            <Link
              className='w-[95%] rounded-lg border border-gray-600 bg-gray-800 py-2 text-center text-sm font-medium text-blue-400 hover:bg-gray-700 hover:text-blue-300'
              to={`/users-histories/${item.id}`}
            >
              User History
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserHistoryContent;
