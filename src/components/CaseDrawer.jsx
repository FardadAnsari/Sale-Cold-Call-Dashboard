import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import clsx from 'clsx';
import ShopInfo from './ShopInfo';
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
          console.log("sale-session-detail", response.data);
          
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
          'fixed inset-0 z-40 transition-opacity duration-300',
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
                activeTab === 'activity' ? tabClasses.active : tabClasses.inactive
              )}
              onClick={() => setActiveTab('activity')}
            >
              Activity History
            </button>
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
            <div className='h-full overflow-y-auto px-6 py-4'>
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
