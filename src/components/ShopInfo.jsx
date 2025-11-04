import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

// Memoize the sanitize function to prevent recreating on every render
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

// Memoize opening hours parsing
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

const ShopInfo = ({ isDarkMode, isDrawer = false, onClose, shop: propShop }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || `/shops${location.search || ''}`;
  const authToken = sessionStorage.getItem('authToken');

  // Use prop shop if provided (from drawer), otherwise fetch by ID
  const {
    data: shop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['singleShop', propShop?.shop_id_GB || id],
    queryFn: async () => {
      // If shop is provided via props, use it directly
      if (propShop) {
        return propShop;
      }

      // Otherwise fetch by ID
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
    enabled: !!propShop || !!id,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className='flex h-screen flex-1 items-center justify-center bg-gray-900 text-gray-300'>
        <div className='mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-orange-500'></div>
        <p className='text-xl'>Loading shop details...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='flex min-h-screen flex-1 flex-col items-center justify-center bg-gray-900 p-8 text-red-400'>
        <img src={sadMaskImg} alt='Error' className='mb-4 h-32 w-32' />
        <p className='mb-2 text-xl font-medium'>Error loading shop details:</p>
        <p className='mb-4 text-center'>{error.message}</p>
        <button
          onClick={isDrawer ? onClose : () => navigate('/')}
          className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
        >
          {isDrawer ? 'Close' : 'Go Back to Sale Zone'}
        </button>
      </div>
    );
  }

  // No shop data state
  if (!shop) {
    return (
      <div className='flex min-h-screen flex-1 flex-col items-center justify-center bg-gray-900 p-8 text-gray-400'>
        <img src={sadMaskImg} alt='Sad Mask' className='mb-4 h-32 w-32' />
        <p className='mb-2 text-xl font-medium'>No details found for this shop.</p>
        <p className='mb-4 text-center text-sm'>
          The shop ID `{id}` might be invalid or no data is available.
        </p>
        <button
          onClick={isDrawer ? onClose : () => navigate('/')}
          className='rounded bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600'
        >
          {isDrawer ? 'Close' : 'Go Back to Sale Zone'}
        </button>
      </div>
    );
  }

  const parsedOpeningHours = parseOpeningHours(shop.opening_hours);

  return (
    <div
      className={`relative mx-auto flex flex-col gap-6 p-6 lg:flex-row ${isDrawer ? 'h-full' : 'h-screen'} w-full ${isDrawer ? '' : 'lg:max-w-7xl'} overflow-hidden`}
    >
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

      {/* Back/Close Button - Only show if not in drawer mode, or show close button in drawer */}
      {!isDrawer ? (
        <button
          onClick={() => navigate(backTo)}
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
      ) : (
        <button
          onClick={onClose}
          className='absolute top-4 left-4 z-10 rounded-full bg-gray-800 p-2 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white'
          aria-label='Close drawer'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      )}

      <div className='flex min-w-0 flex-1 flex-col rounded-lg bg-gray-700 p-6 shadow-md'>
        <div className='custom-scrollbar flex-1 overflow-y-auto pr-2 pb-4'>
          <h2 className='mb-4 text-xl font-semibold text-gray-200'>Shop Details</h2>

          <div className='mb-4 flex items-start'>
            <img src={shopIcon} alt='Shop Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>Name</label>
              <div className='flex items-center gap-2'>
                <p className='text-lg font-bold text-gray-200'>{shop.shop_name}</p>
                {shop.website && shop.website !== 'None' && (
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

          <div className='mb-4 flex items-start'>
            <img src={addressIcon} alt='Address Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>Address</label>
              <p className='text-base text-gray-300'>{shop.address}</p>
            </div>
          </div>

          <div className='mb-4 flex items-start'>
            <img src={timeIcon} alt='Time Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>
                Opening Hours
              </label>
              <ul className='space-y-1'>
                {Object.entries(parsedOpeningHours).map(([day, hours]) => (
                  <li key={day} className='text-sm text-gray-300'>
                    <span className='font-medium'>{day}:</span> {hours}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='mb-4 flex items-start'>
            <img src={postcodeIcon} alt='Postcode Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>Postcode</label>
              <p className='text-base text-gray-300'>{shop.postcode}</p>
            </div>
          </div>

          <div className='mb-4 flex items-start'>
            <img src={phoneIcon} alt='Phone Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>Phone</label>
              <p className='text-base text-gray-300'>{shop.phone}</p>
            </div>
          </div>

          <div className='mb-4 flex items-start'>
            <img src={serviceTypeIcon} alt='Service Type Icon' className='mt-1 mr-3 h-5 w-5' />
            <div>
              <label className='block text-sm font-medium text-gray-400 opacity-70'>
                Service Type
              </label>
              <p className='text-base text-gray-300'>{shop.category}</p>
            </div>
          </div>

          <div className='pl-8'>
            {Array.isArray(shop.providers) && shop.providers.length > 0 && (
              <>
                <label className='block text-sm font-medium text-gray-400 opacity-70'>
                  List Of Providers
                </label>
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
      </div>

      {/* Call History - Only show if not in drawer mode or if there's enough space */}
      {!isDrawer && (
        <div className='flex min-w-0 flex-1 flex-col'>
          <CallHistory isDarkMode={isDarkMode} shopId={shop.shop_id_company} />
        </div>
      )}
    </div>
  );
};

export default ShopInfo;
