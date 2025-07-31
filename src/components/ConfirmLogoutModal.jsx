const ConfirmLogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 dark:text-white'>
        <h2 className='mb-4 text-lg font-semibold'>Confirm Logout</h2>
        <p className='mb-6 text-sm'>Are you sure you want to log out?</p>
        <div className='flex justify-end space-x-4'>
          <button
            onClick={onCancel}
            className='rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700'
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
