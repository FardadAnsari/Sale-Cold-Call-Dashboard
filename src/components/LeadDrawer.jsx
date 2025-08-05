import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import clsx from 'clsx';
import UpdateLead from './UpdateLead';

const LeadDrawer = ({ leadId, isOpen, onClose, isDarkMode = true }) => {

  const authToken = sessionStorage.getItem('authToken');

  const {
    data: lead,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['leadDetail', leadId],
    enabled: isOpen && !!leadId,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/zoho/lead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // console.log("Lead Data",response.data.data[0]);
      // console.log('Lead City Pick', response.data.data[0].City_Pick_List);
      return response.data.data;
    },
  });

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 transition-opacity duration-300',
          isOpen ? 'bg-black/40' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      <div
        className={clsx(
          'fixed top-0 right-0 z-50 h-full w-2/5 overflow-y-auto bg-gray-800 text-white shadow-xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <button className='absolute top-4 right-4 text-xl text-white' onClick={onClose}>
          ×
        </button>
        <div className='p-6'>
          <div className={`custom-scrollbar flex-1 overflow-y-auto pr-2 pb-4`}>
            <UpdateLead isDarkMode={isDarkMode} leadData={lead?.[0] || {}} />
          </div>
        </div>
      </div>
    </>
  );
};

export default LeadDrawer;
