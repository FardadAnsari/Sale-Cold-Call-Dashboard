import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CaseHistory from '../components/CaseHistory';
import shopIcon from '../images/shopicon.png';
import addressIcon from '../images/Address.png';
import timeIcon from '../images/TimeIcon.png';
import postcodeIcon from '../images/Postcode.png';
import serviceTypeIcon from '../images/Servicetype.png';
import phoneIcon from '../images/phone2.png';
import sadMaskImg from '../images/sad-mask.png';
import CaseStage from '../images/CaseStage.png';
import CreateBy from '../images/CreateBy.png'
import axios from 'axios';
import { API_BASE_URL } from 'src/api';

const sanitizeString = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || String(value).trim().toLowerCase() === 'none' || String(value).trim() === '') {
    return defaultValue;
  }
  return String(value).trim();
};

const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'Closed', Tuesday: 'Closed', Wednesday: 'Closed',
    Thursday: 'Closed', Friday: 'Closed', Saturday: 'Closed', Sunday: 'Closed'
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    const parsed = {};
    for (const day in defaultHours) {
      const dayData = openingHoursData[day];
      if (Array.isArray(dayData) && dayData.length > 0) {
        const hoursStrings = dayData.map(slot => {
          const start = sanitizeString(slot.start, 'N/A');
          const end = sanitizeString(slot.end, 'N/A');
          if (start === 'N/A' && end === 'N/A') {
            return 'Closed';
          }
          return `${start}-${end}`;
        });
        const filteredHours = hoursStrings.filter(h => h !== 'Closed');
        parsed[day] = filteredHours.length > 0 ? filteredHours.join(', ') : 'Closed';
      } else if (typeof dayData === 'object' && dayData !== null && dayData.weekday_text && Array.isArray(dayData.weekday_text) && dayData.weekday_text.length > 0) {
        const text = dayData.weekday_text[0];
        parsed[day] = sanitizeString(text.split(': ')[1] || text, 'N/A');
      } else if (typeof dayData === 'object' && dayData !== null && (dayData.open || dayData.close)) {
        const openTime = sanitizeString(dayData.open, '');
        const closeTime = sanitizeString(dayData.close, '');
        if (openTime === 'N/A' && closeTime === 'N/A') {
          parsed[day] = 'Closed';
        } else {
          parsed[day] = `${openTime} - ${closeTime}`.trim();
        }
      } else {
        parsed[day] = 'Closed';
      }
    }
    return parsed;
  }
  return defaultHours;
};

const CaseDetails = ({ isDarkMode }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authToken = sessionStorage.getItem('authToken');
    const [activeLeftTab, setActiveLeftTab] = useState('details');

    const {
      data: caseDetails,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ['singleCase', id],
      queryFn: async () => {
        if (!id) return null;
        const url = `${API_BASE_URL}/history/get-sale-session-detail/${id}/`;
        try {
          const response = await axios.get(url, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          });
           console.log(response);
          return response.data;
         
          
        } catch (err) {
          throw new Error(
            `Axios error! status: ${err.response?.status || 'unknown'} for ID: ${id}`
          );
        }
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
      return (
        <div className='flex h-screen flex-1 items-center justify-center bg-gray-900 text-gray-300'>
          <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
          <p className='text-xl'>Loading case details...</p>
        </div>
      );
    }
    if (isError || !caseDetails) {
      return (
        <div className='flex h-screen items-center justify-center text-red-400'>
          Error: {error?.message || 'No data found'}
        </div>
      );
    }

    const customer = caseDetails.customer || {};
    const googleMaps = caseDetails.googlemaps || customer.customer_google_business || {};
    const openingHours = parseOpeningHours(googleMaps.opening_hours);

  const commonClasses = {
    container: `flex flex-col lg:flex-row gap-6 p-6 mx-auto relative h-screen w-full lg:max-w-7xl overflow-hidden`,
    cardContainer: `flex-1 bg-gray-700 rounded-lg shadow-md p-6 flex flex-col min-w-0`,
    cardContent: `flex-1 pb-4 overflow-y-auto pr-2 custom-scrollbar`,
    heading: `text-xl font-semibold mb-4 text-gray-200`,
    detailItem: `mb-4 flex items-start`,
    icon: `mr-3 w-5 h-5 mt-1`,
    label: `block text-sm font-medium opacity-70 text-gray-400`,
    valueName: `text-lg font-bold text-gray-200`,
    valueDefault: `text-gray-300 text-base`,
    callButtonContainer: `mt-auto pt-4 border-t border-gray-600 flex justify-center`,
    callButton: `w-full max-w-lg h-[35px] flex items-center justify-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-small transition-colors duration-200`,
    historyHeading: `text-lg font-semibold mb-3 text-gray-200`,
    historyListItem: `bg-gray-800 p-3 rounded-md shadow-sm`,
    historyDate: `font-semibold text-gray-200`,
    historyDuration: `text-sm text-gray-400`,
    historyDescription: `text-gray-300 text-sm mb-1`,
    historyUser: `text-xs text-gray-500`,
    tabButtonContainer: `flex mb-4 -mt-2 -mx-4 px-4 pt-2 border-b border-gray-600`,
    tabButton: `py-2 px-4 text-sm font-medium focus:outline-none`,
    tabButtonActive: `border-b-2 border-blue-500 text-blue-500`,
    tabButtonInactive: `text-gray-400 hover:text-gray-200`,
  };

  if (isError) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-red-400 min-h-screen">
        <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
        <p className="mb-2 text-xl font-medium">Error loading case details:</p>
        <p className="text-center mb-4">{error.message}</p>
        <button onClick={() => navigate('/cases')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
          Go Back to Cases
        </button>
      </div>
    );
  }

  if (!caseDetails) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-gray-400 min-h-screen">
        <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
        <p className="mb-2 text-xl font-medium">No details found for this case.</p>
        <p className="text-sm text-center mb-4">The case ID `{id}` might be invalid or no data is available.</p>
        <button onClick={() => navigate('/cases')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
          Go Back to Cases
        </button>
      </div>
    );
  }

  // const displayPhoneNumber = caseDetails.phone !== 'N/A' ? caseDetails.phone : caseDetails.customerPhone !== 'N/A' ? caseDetails.customerPhone : 'N/A';
  // const callPhoneNumber = displayPhoneNumber !== 'N/A' ? `tel:${displayPhoneNumber}` : '#';

  return (
    <div className={commonClasses.container}>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
      `}</style>
      <button
        onClick={() => navigate('/cases')}
        className='absolute top-4 left-4 z-10 rounded-full bg-gray-800 p-2 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white'
        aria-label='Go back to Cases'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
        </svg>
      </button>
      <div className={commonClasses.cardContainer}>
        <div className={commonClasses.tabButtonContainer}>
          <button
            className={`${commonClasses.tabButton} ${activeLeftTab === 'details' ? commonClasses.tabButtonActive : commonClasses.tabButtonInactive}`}
            onClick={() => setActiveLeftTab('details')}
          >
            Case Details
          </button>
          <button
            className={`${commonClasses.tabButton} ${activeLeftTab === 'history' ? commonClasses.tabButtonActive : commonClasses.tabButtonInactive}`}
            onClick={() => setActiveLeftTab('history')}
          >
            Activity History
          </button>
        </div>
        <div className={commonClasses.cardContent}>
          {activeLeftTab === 'details' ? (
            <>
              <div className={commonClasses.detailItem}>
                <img src={shopIcon} alt='Shop Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Shop Name</label>

                  <div className='flex items-center gap-2'>
                    <p className={commonClasses.valueName}>{caseDetails.googlemaps.shop_name}</p>
                    {caseDetails.googlemaps.website && caseDetails.googlemaps.website !== "None" && (
                      <a
                        href={caseDetails.googlemaps.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-blue-400 hover:underline'
                      >
                        visit website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={addressIcon} alt='Address Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Address</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.googlemaps.address || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={timeIcon} alt='Time Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Opening Hours</label>
                  <ul className='space-y-1'>
                    {Object.entries(openingHours || {}).map(([day, hours]) => (
                      <li key={day} className='text-sm text-gray-300'>
                        <span className='font-medium'>{day}:</span> {hours}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={postcodeIcon} alt='Postcode Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Postcode</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.googlemaps.postcode || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={phoneIcon} alt='Phone Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Phone</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.googlemaps.phone || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={serviceTypeIcon} alt='Service Type Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Service Type</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.googlemaps.services || 'N/A'}
                  </p>
                </div>
              </div>

              <div className={commonClasses.detailItem}>
                <img src={CaseStage} alt='Case Stage Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Case Stage</label>
                  <p className={commonClasses.valueDefault}>{caseDetails.sale_session.stage}</p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={CreateBy} alt='Created By Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Created By</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.sale_session.created_by}
                  </p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={timeIcon} alt='Start Time Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Start Time</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.sale_session.session_start_date}
                  </p>
                </div>
              </div>
              <div className={commonClasses.detailItem}>
                <img src={timeIcon} alt='Last Update Icon' className={commonClasses.icon} />
                <div>
                  <label className={commonClasses.label}>Last Update</label>
                  <p className={commonClasses.valueDefault}>
                    {caseDetails.sale_session.last_update}
                  </p>
                </div>
              </div>
              <div className='pl-8'>
                {Array.isArray(caseDetails.googlemaps.providers) &&
                  caseDetails.googlemaps.providers.length > 0 && (
                    <>
                      <label className={commonClasses.label}>List Of Providers</label>
                      <ul className='space-y-1 pt-1'>
                        {caseDetails.googlemaps.providers.map((provider, index) => (
                          <li key={index}>
                            <a
                              href={provider.provider_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-400 hover:underline'
                            >
                              {provider.provider_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
              </div>
            </>
          ) : (
            <>
              <h2 className={commonClasses.historyHeading}>Activity History</h2>
              {caseDetails.history.length > 0 ? (
                <ul className='space-y-4'>
                  {caseDetails.history.map((item) => (
                    <li key={item.history_id} className={commonClasses.historyListItem}>
                      <div className='mb-1 flex items-center justify-between'>
                        <p className={commonClasses.historyDate}>{item.date}</p>
                      </div>
                      <p className={commonClasses.historyDescription}>
                        Description: {item.description || 'No description provided.'}
                      </p>
                      <p className={commonClasses.historyUser}>
                        User: {item.user_name || 'Unknown User'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No previous activities recorded for this case.
                </p>
              )}
            </>
          )}
        </div>
        {/* <div className={commonClasses.callButtonContainer}>
          <a
            href={callPhoneNumber}
            className={commonClasses.callButton}
            onClick={(e) => displayPhoneNumber === 'N/A' && e.preventDefault()}
          >
            <img src={phoneIcon} alt='Phone Icon' className='h-5 w-5' />
            {displayPhoneNumber !== 'N/A' ? 'Call' : 'Phone N/A'}
          </a>
        </div> */}
      </div>
      <div className='flex min-w-0 flex-1 flex-col'>
        <CaseHistory
          caseDetails={caseDetails}
          isDarkMode={isDarkMode}
          initialCustomerName={caseDetails.customerName}
          initialCustomerPhone={caseDetails.customerPhone}
          initialGateKeeperName={caseDetails.gateKeeperName}
          initialGateKeeperPhone={caseDetails.gateKeeperPhone}
          initialCustomerAvailability={caseDetails.customerAvailability}
        />
      </div>
    </div>
  );
};

export default CaseDetails;
