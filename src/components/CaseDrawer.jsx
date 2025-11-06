import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import clsx from 'clsx';
import ShopInfo from './ShopInfo';
import CallHistory from './CallHistory';
import CreateLead from './CreateLead';
import ActivityHistory from './ActivityHistory';
import CaseHistory from './CaseHistory';

const CaseDrawer = ({ isOpen, onClose, isDarkMode = true, shop, caseData, mode = 'shop' }) => {
  const [sessionId, setSessionId] = useState('');
  const authToken = sessionStorage.getItem('authToken');
  const [activeTab, setActiveTab] = useState(mode === 'case' ? 'activity' : 'shopInfo');

  // Fetch detailed data based on mode
  const { data: detailedData, isLoading } = useQuery({
    queryKey: [
      mode === 'case' ? 'caseDetails' : 'shopDetails',
      mode === 'case' ? caseData?.sale_session_id : shop?.shop_id_GB,
    ],
    queryFn: async () => {
      if (mode === 'case') {
        // Fetch case details
        if (!caseData?.sale_session_id) return null;

        const url = `${API_BASE_URL}/history/get-sale-session-detail/${caseData.sale_session_id}/`;
        try {
          const response = await axios.get(url, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          });
          return response.data;
        } catch (err) {
          throw new Error(`Error fetching case details: ${err.response?.status || 'unknown'}`);
        }
      } else {
        // Fetch shop details (original functionality)
        if (!shop?.shop_id_GB) return null;

        const url = `${API_BASE_URL}/Shops/?id=${shop.shop_id_GB}`;
        try {
          const response = await axios.get(url, {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          });

          const data = response.data;
          if (data.results && Array.isArray(data.results) && data.results.length > 0) {
            return data.results[0];
          } else {
            throw new Error('Shop details not found');
          }
        } catch (err) {
          throw new Error(`Error fetching shop details: ${err.response?.status || 'unknown'}`);
        }
      }
    },
    enabled:
      isOpen &&
      ((mode === 'case' && !!caseData?.sale_session_id) || (mode === 'shop' && !!shop?.shop_id_GB)),
  });

  const tabClasses = {
    base: 'px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none flex-1 text-center',
    active: 'border-b-2 border-orange-500 text-orange-500',
    inactive: isDarkMode
      ? 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'
      : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent',
  };

  // Determine available tabs based on mode
  const getAvailableTabs = () => {
    if (mode === 'case') {
      return ['activity', 'shopInfo', 'callSummary', 'createLead'];
    }
    return ['shopInfo', 'callSummary', 'createLead', 'activity'];
  };

  const availableTabs = getAvailableTabs();

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 transition-opacity duration-300',
          isOpen ? 'bg-black/40' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed top-0 right-0 z-50 flex h-full w-2/5 flex-col bg-gray-800 text-white shadow-xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Close Button */}
        {/* <button
          className='absolute top-4 right-4 z-10 rounded-full bg-gray-700 p-2 text-white transition-colors duration-200 hover:bg-gray-600'
          onClick={onClose}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button> */}

        {/* Tabs Navigation */}
        <div className='flex-shrink-0 border-b border-gray-700 bg-gray-800'>
          <div className='flex'>
            {availableTabs.includes('shopInfo') && (
              <button
                className={clsx(
                  tabClasses.base,
                  activeTab === 'shopInfo' ? tabClasses.active : tabClasses.inactive
                )}
                onClick={() => setActiveTab('shopInfo')}
              >
                Shop Info
              </button>
            )}
            {availableTabs.includes('callSummary') && (
              <button
                className={clsx(
                  tabClasses.base,
                  activeTab === 'callSummary' ? tabClasses.active : tabClasses.inactive
                )}
                onClick={() => setActiveTab('callSummary')}
              >
                Call Summary
              </button>
            )}
            {availableTabs.includes('createLead') && (
              <button
                className={clsx(
                  tabClasses.base,
                  activeTab === 'createLead' ? tabClasses.active : tabClasses.inactive
                )}
                onClick={() => setActiveTab('createLead')}
              >
                Create Lead
              </button>
            )}
            {availableTabs.includes('activity') && (
              <button
                className={clsx(
                  tabClasses.base,
                  activeTab === 'activity' ? tabClasses.active : tabClasses.inactive
                )}
                onClick={() => setActiveTab('activity')}
              >
                Activity History
              </button>
            )}
          </div>
        </div>

        {/* Tab Content - Single scrollable container */}
        <div className='flex-1 overflow-hidden'>
          {/* Loading State */}
          {isLoading && (
            <div className='flex h-full items-center justify-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>
                Loading {mode === 'case' ? 'case' : 'shop'} details...
              </p>
            </div>
          )}

          {/* Shop Info Tab */}
          {!isLoading && activeTab === 'shopInfo' && detailedData && (
            <div className='h-full overflow-y-auto'>
              <ShopInfo
                shop={mode === 'case' ? detailedData.googlemaps : detailedData}
                isDarkMode={isDarkMode}
                isDrawer={true}
                onClose={onClose}
                onSessionCreated={setSessionId}
                hideCreateCase={true}
              />
            </div>
          )}

          {/* Call Summary Tab */}
          {!isLoading && activeTab === 'callSummary' && detailedData && (
            <div className='h-full overflow-y-auto p-4'>
              <CaseHistory
                isDarkMode={isDarkMode}
                caseDetails={mode === 'case' ? detailedData : null}
                isDrawer={true}
                hideInternalTabs={true}
              />
            </div>
          )}

          {/* Create Lead Tab */}
          {!isLoading && activeTab === 'createLead' && detailedData && (
            <div className='h-full overflow-y-auto p-4'>
              <CreateLead
                isDarkMode={isDarkMode}
                shopId={
                  mode === 'case'
                    ? detailedData.customer?.shop_id_company
                    : detailedData.shop_id_company
                }
                shopName={
                  mode === 'case' ? detailedData.googlemaps?.shop_name : detailedData.shop_name
                }
                isDrawer={true}
              />
            </div>
          )}

          {/* Activity History Tab */}
          {!isLoading && activeTab === 'activity' && detailedData && (
            <div className='h-full overflow-y-auto p-4'>
              <ActivityHistory caseDetails={detailedData} isDarkMode={isDarkMode} isDrawer={true} />
            </div>
          )}

          {/* Error State */}
          {!isLoading &&
            ((mode === 'case' && caseData) || (mode === 'shop' && shop)) &&
            !detailedData && (
              <div className='flex h-full flex-col items-center justify-center p-8 text-red-400'>
                <p className='mb-2 text-xl font-medium'>
                  Error loading {mode === 'case' ? 'case' : 'shop'} details
                </p>
                <p className='mb-4 text-center'>Unable to load details.</p>
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
