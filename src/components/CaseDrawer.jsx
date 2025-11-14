import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import clsx from 'clsx';
import ShopInfo from './ShopInfo';
import CreateLead from './CreateLead';
import ActivityHistory from './ActivityHistory';
import CaseHistory from './CaseHistory';

const CaseDrawer = ({ isOpen, onClose, isDarkMode = true, caseData }) => {
  const [sessionId, setSessionId] = useState('');
  const authToken = sessionStorage.getItem('authToken');
  const [activeTab, setActiveTab] = useState('shopInfo');
  const queryClient = useQueryClient();

  // Fetch case details only
  const {
    data: detailedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['caseDetails', caseData?.sale_session_id],
    queryFn: async () => {
      if (!caseData?.sale_session_id) return null;

      const url = `${API_BASE_URL}/history/get-sale-session-detail/${caseData.sale_session_id}/`;
      try {
        const response = await axios.get(url, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
        console.log('sale-session-detail', response.data);
        return response.data;
      } catch (err) {
        throw new Error(`Error fetching case details: ${err.response?.status || 'unknown'}`);
      }
    },
    enabled: isOpen && !!caseData?.sale_session_id,
  });

  // Handle case update from CaseHistory component
  const handleCaseUpdated = async () => {
    console.log('Case updated, refetching data...');

    // Refetch the current case details
    await refetch();

    // Invalidate and refetch the main cases list
    await queryClient.invalidateQueries(['sale-sessions']);

    // Invalidate activity history queries if they exist
    await queryClient.invalidateQueries(['activity-history']);

    console.log('Data refetched successfully');
  };

  const tabClasses = {
    base: 'p-3 text-sm transition-colors duration-200 focus:outline-none flex mx-1 text-center',
    active: 'rounded-lg text-white bg-blue-500',
    inactive: isDarkMode
      ? 'rounded-lg text-gray-400 hover:text-gray-200 border'
      : 'rounded-lg text-gray-600 hover:text-gray-800 border',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 h-full transition-opacity duration-300',
          isOpen ? 'bg-black/40' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 right-0 z-50 flex h-full w-1/3 flex-col bg-gray-800 text-white shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Tabs Navigation */}
        <div className='flex-shrink-0'>
          <div className='flex px-4 py-2'>
            <button
              className={clsx(
                tabClasses.base,
                activeTab === 'shopInfo' ? tabClasses.active : tabClasses.inactive
              )}
              onClick={() => setActiveTab('shopInfo')}
            >
              Shop Info
            </button>
            <button
              className={clsx(
                tabClasses.base,
                activeTab === 'callSummary' ? tabClasses.active : tabClasses.inactive
              )}
              onClick={() => setActiveTab('callSummary')}
            >
              Call Summary
            </button>
            <button
              className={clsx(
                tabClasses.base,
                activeTab === 'createLead' ? tabClasses.active : tabClasses.inactive
              )}
              onClick={() => setActiveTab('createLead')}
            >
              Create Lead
            </button>
            <button
              className={clsx(
                tabClasses.base,
                activeTab === 'activityHistory' ? tabClasses.active : tabClasses.inactive
              )}
              onClick={() => setActiveTab('activityHistory')}
            >
              Activity History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className='flex-1 overflow-hidden'>
          {isLoading && (
            <div className='flex h-full items-center justify-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading case details...</p>
            </div>
          )}

          {!isLoading && activeTab === 'shopInfo' && detailedData && (
            <div className='h-full overflow-y-auto'>
              <ShopInfo
                shop={detailedData.googlemaps}
                isDarkMode={isDarkMode}
                isDrawer={true}
                onClose={onClose}
                onSessionCreated={setSessionId}
                hideCreateCase={true}
              />
            </div>
          )}

          {!isLoading && activeTab === 'callSummary' && detailedData && (
            <div className='h-full overflow-y-auto px-6 py-4'>
              <CaseHistory
                isDarkMode={isDarkMode}
                caseDetails={detailedData}
                isDrawer={true}
                hideInternalTabs={true}
                onCaseUpdated={handleCaseUpdated} // Pass the refetch handler
              />
            </div>
          )}

          {!isLoading && activeTab === 'createLead' && detailedData && (
            <div className='h-full overflow-y-auto px-6 py-4'>
              <CreateLead
                isDarkMode={isDarkMode}
                shopId={detailedData.customer?.shop_id_company}
                shopName={detailedData.googlemaps?.shop_name}
                isDrawer={true}
              />
            </div>
          )}

          {!isLoading && activeTab === 'activityHistory' && detailedData && (
            <div className='h-full overflow-y-auto px-6 py-4'>
              <ActivityHistory caseDetails={detailedData} isDarkMode={isDarkMode} isDrawer={true} />
            </div>
          )}

          {!isLoading && caseData && !detailedData && (
            <div className='flex h-full flex-col items-center justify-center p-8 text-red-400'>
              <p className='mb-2 text-xl font-medium'>Error loading case details</p>
              <p className='mb-4 text-center'>Unable to load case details.</p>
              <button
                onClick={onClose}
                className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
              >
                Close
              </button>
            </div>
          )}

          {!isLoading && !caseData && (
            <div className='flex h-full flex-col items-center justify-center p-8 text-gray-400'>
              <p className='mb-2 text-xl font-medium'>No case selected</p>
              <p className='mb-4 text-center'>Please select a case to view details.</p>
              <button
                onClick={onClose}
                className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CaseDrawer;
