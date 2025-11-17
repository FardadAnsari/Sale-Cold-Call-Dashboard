import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import clsx from 'clsx';
import ShopInfo from './ShopInfo';
import CallHistory from './CallHistory';
import CreateLead from './CreateLead';

const ShopDrawer = ({ isOpen, onClose, isDarkMode = true, shop, onCaseCreated }) => {
  const authToken = sessionStorage.getItem('authToken');
  const [activeTab, setActiveTab] = useState('shopInfo');
  const [sessionId, setSessionId] = useState(null);

  // Fetch shop details only
  const {
    data: detailedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['shopDetails', shop?.shop_id_GB],
    queryFn: async () => {
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
          const shopData = data.results[0];
          // console.log('Shop data fetched in drawer:', shopData);
          // console.log('Sale session ID from API:', shopData.sale_session_id);
          return shopData;
        } else {
          throw new Error('Shop details not found');
        }
      } catch (err) {
        throw new Error(`Error fetching shop details: ${err.response?.status || 'unknown'}`);
      }
    },
    enabled: isOpen && !!shop?.shop_id_GB,
  });

  // Update sessionId when detailedData is loaded or changes
  useEffect(() => {
    if (detailedData?.sale_session_id) {
      // console.log('Setting sessionId from detailedData:', detailedData.sale_session_id);
      setSessionId(detailedData.sale_session_id);
    }
  }, [detailedData]);

  // Handle session creation from ShopInfo
  const handleSessionCreated = (newSessionId) => {
    // console.log('Session created callback received:', newSessionId);
    setSessionId(newSessionId);

    // Refetch shop data to get updated sale_session_id and case_created status
    refetch();
  };

  // Handle case creation from ShopInfo
  const handleCaseCreated = (shopId) => {
    // console.log('Case created for shop:', shopId);
    if (onCaseCreated) {
      onCaseCreated(shopId);
    }
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
          </div>
        </div>

        {/* Tab Content */}
        <div className='flex-1 overflow-hidden'>
          {isLoading && (
            <div className='flex h-full items-center justify-center'>
              <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
              <p className='text-xl text-gray-300'>Loading shop details...</p>
            </div>
          )}

          {!isLoading && activeTab === 'shopInfo' && detailedData && (
            <div className='h-full overflow-y-auto'>
              <ShopInfo
                shop={detailedData}
                isDarkMode={isDarkMode}
                isDrawer={true}
                onClose={onClose}
                onSessionCreated={handleSessionCreated}
                onCaseCreated={handleCaseCreated}
                onTabChange={setActiveTab}
                hideCreateCase={false}
              />
            </div>
          )}

          {!isLoading && activeTab === 'callSummary' && detailedData && (
            <div className='h-full overflow-y-auto px-6 py-4'>
              <CallHistory
                isDarkMode={isDarkMode}
                shopId={detailedData.shop_id_company}
                sessionId={sessionId} // Use the sessionId state
                isDrawer={true}
                hideInternalTabs={true}
              />
            </div>
          )}

          {!isLoading && activeTab === 'createLead' && detailedData && (
            <div className='h-full overflow-y-auto px-6 py-4'>
              <CreateLead
                isDarkMode={isDarkMode}
                shopId={detailedData.shop_id_company}
                shopName={detailedData.shop_name}
                isDrawer={true}
              />
            </div>
          )}

          {!isLoading && shop && !detailedData && (
            <div className='flex h-full flex-col items-center justify-center p-8 text-red-400'>
              <p className='mb-2 text-xl font-medium'>Error loading shop details</p>
              <p className='mb-4 text-center'>Unable to load shop details.</p>
              <button
                onClick={onClose}
                className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
              >
                Close
              </button>
            </div>
          )}

          {!isLoading && !shop && (
            <div className='flex h-full flex-col items-center justify-center p-8 text-gray-400'>
              <p className='mb-2 text-xl font-medium'>No shop selected</p>
              <p className='mb-4 text-center'>Please select a shop to view details.</p>
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

export default ShopDrawer;
