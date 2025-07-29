import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CallHistory from '../components/CallHistory';
import shopIcon from '../images/shopicon.png';
import addressIcon from '../images/Address.png';
import timeIcon from '../images/TimeIcon.png';
import postcodeIcon from '../images/Postcode.png';
import serviceTypeIcon from '../images/Servicetype.png';
import phoneIcon from '../images/phone2.png';
import sadMaskImg from '../images/sad-mask.png';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';

const sanitizeString = (value, defaultValue = 'N/A') => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim().toLowerCase() === 'none' ||
    String(value).trim() === ''
  ) {
    return defaultValue;
  }
  return String(value).trim();
};

const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'N/A',
    Tuesday: 'N/A',
    Wednesday: 'N/A',
    Thursday: 'N/A',
    Friday: 'N/A',
    Saturday: 'N/A',
    Sunday: 'N/A',
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    const parsed = {};
    for (const day in defaultHours) {
      const dayData = openingHoursData[day];
      if (Array.isArray(dayData) && dayData.length > 0) {
        const timeSlots = dayData
          .map((slot) => {
            if (typeof slot === 'object' && slot !== null && slot.start && slot.end) {
              const startTime = sanitizeString(slot.start, '');
              const endTime = sanitizeString(slot.end, '');
              if (startTime && endTime) {
                return `${startTime} - ${endTime}`;
              }
            }
            return sanitizeString(slot, 'N/A');
          })
          .filter((slot) => slot !== 'N/A');

        parsed[day] = timeSlots.length > 0 ? timeSlots.join(', ') : 'Closed';
      } else {
        parsed[day] = 'Closed';
      }
    }
    return parsed;
  }
  return defaultHours;
};

const ShopDetails = ({ isDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem('authToken');

  const {
    data: shop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['singleShop', id],
    queryFn: async () => {
      if (!id) return null;

      const url = `${API_BASE_URL}/Shops/?id=${id}`;

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
          throw new Error(`Shop details not found or invalid response format for ID: ${id}`);
        }
      } catch (err) {
        throw new Error(`Axios error: ${err.response?.status || 'unknown'} for ID: ${id}`);
      }
    },
    enabled: !!id,
  });

  console.log(shop);
  
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
  };

  if (isLoading) {
    return (
      <div className='flex h-screen flex-1 items-center justify-center bg-gray-900 text-gray-300'>
        <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
        <p className='text-xl'>Loading shop details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex min-h-screen flex-1 flex-col items-center justify-center bg-gray-900 p-8 text-red-400'>
        <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
        <p className='mb-2 text-xl font-medium'>Error loading shop details:</p>
        <p className='mb-4 text-center'>{error.message}</p>
        <button
          onClick={() => navigate('/')}
          className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
        >
          Go Back to Sale Zone
        </button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className='flex min-h-screen flex-1 flex-col items-center justify-center bg-gray-900 p-8 text-gray-400'>
        <img src={sadMaskImg} alt='Sad Mask' className='mb-4 h-32 w-32' />
        <p className='mb-2 text-xl font-medium'>No details found for this shop.</p>
        <p className='mb-4 text-center text-sm'>
          The shop ID `{id}` might be invalid or no data is available.
        </p>
        <button
          onClick={() => navigate('/')}
          className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
        >
          Go Back to Sale Zone
        </button>
      </div>
    );
  }

  const parsedOpeningHours = parseOpeningHours(shop.opening_hours);

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
          scroll-behavior: smooth;
        }
      `}</style>

      <button
        onClick={() => navigate('/shops')}
        className='absolute top-4 left-4 z-10 rounded-full bg-gray-800 p-2 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white'
        aria-label='Go back to Sale Zone'
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
        <div className={commonClasses.cardContent}>
          <h2 className={commonClasses.heading}>Shop Details</h2>

          <div className={commonClasses.detailItem}>
            <img src={shopIcon} alt='Shop Icon' className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Name</label>
              <div className='flex items-center gap-2'>
                <p className={commonClasses.valueName}>{shop.shop_name}</p>
                {(shop.website && shop.website !== "None") && (
                  <a
                    href={shop.website}
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
              <p className={commonClasses.valueDefault}>{shop.address}</p>
            </div>
          </div>

          <div className={commonClasses.detailItem}>
            <img src={timeIcon} alt='Time Icon' className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Opening Hours</label>
              <ul className='space-y-1'>
                {Object.entries(parsedOpeningHours).map(([day, hours]) => (
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
              <p className={commonClasses.valueDefault}>{shop.postcode}</p>
            </div>
          </div>

          <div className={commonClasses.detailItem}>
            <img src={phoneIcon} alt='Phone Icon' className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Phone</label>
              <p className={commonClasses.valueDefault}>{shop.phone}</p>
            </div>
          </div>

          <div className={commonClasses.detailItem}>
            <img src={serviceTypeIcon} alt='Service Type Icon' className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Service Type</label>
              <p className={commonClasses.valueDefault}>{shop.category}</p>
            </div>
          </div>

          <div className='pl-8'>
            {Array.isArray(shop.providers) && shop.providers.length > 0 && (
              <>
                <label className={commonClasses.label}>List Of Providers</label>
                <ul className='space-y-1 pt-1'>
                  {shop.providers.map((provider, index) => (
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
        </div>
        {/* <div className={commonClasses.callButtonContainer}>
          <button className={commonClasses.callButton}>
            <img src={phoneIcon} alt='Phone Icon' className='h-5 w-5' />
            Call Shop Now
          </button>
        </div> */}
      </div>

      <div className='flex min-w-0 flex-1 flex-col'>
        <CallHistory isDarkMode={isDarkMode} shopId={shop.shop_id_company} />
      </div>
    </div>
  );
};

export default ShopDetails;
