import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import shopIcon from '../images/shopicon.png';
import addressIcon from '../images/Address.png';
import timeIcon from '../images/TimeIcon.png';
import postcodeIcon from '../images/Postcode.png';
import serviceTypeIcon from '../images/Servicetype.png';
import phoneIcon from '../images/phone2.png';
import sadMaskImg from '../images/sad-mask.png';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';
import { useState } from 'react';
import Swal from 'sweetalert2';
import useUser from 'src/useUser';

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
    Monday: { text: 'N/A', isClosed: false },
    Tuesday: { text: 'N/A', isClosed: false },
    Wednesday: { text: 'N/A', isClosed: false },
    Thursday: { text: 'N/A', isClosed: false },
    Friday: { text: 'N/A', isClosed: false },
    Saturday: { text: 'N/A', isClosed: false },
    Sunday: { text: 'N/A', isClosed: false },
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

        parsed[day] = {
          text: timeSlots.length > 0 ? timeSlots.join(', ') : 'Closed',
          isClosed: timeSlots.length === 0,
        };
      } else {
        parsed[day] = {
          text: 'Closed',
          isClosed: true,
        };
      }
    }
    return parsed;
  }
  return defaultHours;
};

const ShopInfo = ({
  isDarkMode,
  isDrawer = false,
  onClose,
  shop: propShop,
  onSessionCreated,
  hideCreateCase = false,
  onCaseCreated, // Add this prop to notify parent
  onTabChange, // Add this prop to handle tab changes
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = sessionStorage.getItem('authToken');
  const { data: user } = useUser();
  const queryClient = useQueryClient(); // Add queryClient for cache invalidation
  console.log(propShop);

  const [sessionId, setSessionId] = useState('');
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  // Use prop shop if provided (from drawer), otherwise fetch by ID
  const {
    data: shop,
    isLoading,
    isError,
    error,
    refetch, // Add refetch function
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

  const handleCreateCase = async () => {
    if (!shop?.shop_id_company) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Shop information is not available.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
      return;
    }

    setIsCreatingCase(true);

    try {
      const leadPayload = {
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        close_time: new Date().toISOString(),
        created_by: user?.id,
        customer: {
          shop_id_company: shop.shop_id_company,
        },
      };

      const sessionResponse = await axios.post(
        `${API_BASE_URL}/history/create-sale-session/`,
        leadPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const newSessionId = sessionResponse?.data?.sale_session_id;
      setSessionId(newSessionId);

      // Pass session ID to parent
      if (onSessionCreated) {
        onSessionCreated(newSessionId);
      }

      // Notify parent that case was created
      if (onCaseCreated) {
        onCaseCreated(shop.shop_id_company);
      }

      // Invalidate and refetch the shop data to get updated case_created status
      await queryClient.invalidateQueries(['singleShop', propShop?.shop_id_GB || id]);
      await refetch();

      // Redirect to call summary tab
      if (onTabChange) {
        onTabChange('callSummary');
      }

      // Success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Case created successfully. Redirecting to call summary...',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
        timer: 4000,
        showConfirmButton: false,
      });

      console.log('Case created with session ID:', newSessionId);
    } catch (error) {
      console.error('Create Case Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while creating the case.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
    } finally {
      setIsCreatingCase(false);
    }
  };

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
    <div className='flex h-full w-full flex-col gap-4 px-6'>
      {/* Conditionally render Create Case button */}
      {!hideCreateCase && (
        <div className='p-4'>
          {!shop.case_created ? (
            <button
              onClick={handleCreateCase}
              disabled={isCreatingCase}
              className={`rounded-md border border-orange-500 p-2 text-sm font-medium transition-colors duration-200 ${
                isCreatingCase
                  ? 'cursor-not-allowed bg-orange-400 text-white'
                  : 'text-orange-500 hover:bg-orange-200'
              }`}
            >
              {isCreatingCase ? 'Creating Case...' : 'Create Case'}
            </button>
          ) : (
            <p className='text-green-500'>Case Created</p>
          )}
        </div>
      )}

      <div className='mb-4 flex items-start'>
        <img src={shopIcon} alt='Shop Icon' className='mt-1 mr-3 h-5 w-5' />
        <div className='flex items-center gap-2'>
          <p className='text-lg font-semibold text-gray-200'>{shop.shop_name}</p>
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

      <div className='mb-4 flex items-start'>
        <img src={addressIcon} alt='Address Icon' className='mt-1 mr-3 h-5 w-5' />

        <p className='text-lg text-gray-300'>{shop.address}</p>
      </div>

      <div className='mb-4 flex items-start'>
        <img src={timeIcon} alt='Time Icon' className='mt-1 mr-3 h-5 w-5' />
        <div className='w-full'>
          {Object.entries(parsedOpeningHours).map(
            (
              [day, data] // ← Use parsedOpeningHours
            ) => (
              <div key={day} className='flex gap-4 text-lg'>
                <span className='font-medium text-gray-300'>{day}:</span>
                <span className={data.isClosed ? 'font-medium text-red-500' : 'text-gray-300'}>
                  {data.text}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <div className='mb-4 flex items-start'>
        <img src={postcodeIcon} alt='Postcode Icon' className='mt-1 mr-3 h-5 w-5' />
        <p className='text-lg text-gray-300'>{shop.postcode}</p>
      </div>

      <div className='mb-4 flex items-start'>
        <img src={phoneIcon} alt='Phone Icon' className='mt-1 mr-3 h-5 w-5' />
        <p className='text-lg text-gray-300'>{shop.phone}</p>
      </div>

      <div className='mb-4 flex items-start'>
        <img src={serviceTypeIcon} alt='Service Type Icon' className='mt-1 mr-3 h-5 w-5' />
        <p className='text-lg text-gray-300'>{shop.category}</p>
      </div>

      <div className='pl-8'>
        {Array.isArray(shop.providers) && shop.providers.length > 0 && (
          <>
            <p
             className='block text-lg font-medium text-gray-400 opacity-70'>
              List Of Providers
            </p>
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
  );
};

export default ShopInfo;
