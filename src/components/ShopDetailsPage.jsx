import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import CallHistory from '../components/CallHistory';
import shopIcon from '../images/shopicon.png';
import addressIcon from '../images/address.png';
import timeIcon from '../images/timeicon.png';
import postcodeIcon from '../images/postcode.png';
import serviceTypeIcon from '../images/Servicetype.png';
import phoneIcon from '../images/phone.png';
import sadMaskImg from '../images/sad-mask.png';

const sanitizeString = (value, defaultValue = 'N/A') => {
  if (value === null || value === undefined || String(value).trim().toLowerCase() === 'none' || String(value).trim() === '') {
    return defaultValue;
  }
  return String(value).trim();
};

const extractCityFromAddress = (address) => {
  const sanitizedAddress = sanitizeString(address, '');
  if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
  const parts = sanitizedAddress.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
};

const parseOpeningHours = (openingHoursData) => {
  const defaultHours = {
    Monday: 'N/A', Tuesday: 'N/A', Wednesday: 'N/A',
    Thursday: 'N/A', Friday: 'N/A', Saturday: 'N/A', Sunday: 'N/A'
  };
  if (typeof openingHoursData === 'object' && openingHoursData !== null) {
    const parsed = {};
    for (const day in defaultHours) {
      const dayData = openingHoursData[day];
      if (Array.isArray(dayData) && dayData.length > 0) {
        parsed[day] = dayData.map(hour => sanitizeString(hour, 'N/A')).join(', ');
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

const transformSingleShopData = (apiItem) => {
  if (!apiItem) return null;
  return {
    id: apiItem.id || apiItem.shop_id_company,
    name: sanitizeString(apiItem.shop_name, 'Unknown Shop'),
    serviceType: sanitizeString(apiItem.category, 'Unknown'),
    postcode: sanitizeString(apiItem.postcode, 'N/A'),
    city: extractCityFromAddress(apiItem.address) || 'Unknown',
    website: sanitizeString(apiItem.website, ''),
    status: apiItem.is_open_now ? 'open' : 'closed',
    address: sanitizeString(apiItem.address, ''),
    phone: sanitizeString(apiItem.phone, ''),
    rating: sanitizeString(apiItem.rating, 'N/A'),
    total_reviews: apiItem.total_reviews || 0,
    latitude: apiItem.latitude || '',
    longitude: apiItem.longitude || '',
    openingHours: parseOpeningHours(apiItem.opening_hours),
    services: sanitizeString(apiItem.services, ''),
    providers: apiItem.providers || [],
    provider_url: sanitizeString(apiItem.provider_url, ''),
    search_txt: sanitizeString(apiItem.search_txt, ''),
    category: sanitizeString(apiItem.category, 'Unknown')
  };
};

const ShopDetailsPage = ({ isDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: shop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['singleShop', id],
    queryFn: async () => {
      if (!id) return null;
      const url = `https://sale.mega-data.co.uk/Shops/?id=${id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} for ID: ${id}`);
      }
      const data = await response.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        return transformSingleShopData(data.results[0]);
      } else {
        throw new Error(`Shop details not found or invalid response format for ID: ${id}`);
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const commonClasses = {
    // Main container now explicitly sized to fit screen height and hide its own overflow
    container: `flex flex-col lg:flex-row gap-6 p-6 mx-auto relative h-screen w-full lg:max-w-7xl overflow-hidden`,
    // Card container is now simply flex-1 and a flex column to hold its content and button
    cardContainer: `flex-1 bg-gray-700 rounded-lg shadow-md p-6 flex flex-col min-w-0`,
    // Card content with enhanced scrollbar styling
    cardContent: `flex-1 pb-4 overflow-y-auto pr-2 custom-scrollbar`,
    heading: `text-xl font-semibold mb-4 text-gray-200`,
    // Reduced margin for detail items
    detailItem: `mb-4 flex items-start`,
    // Reduced icon size slightly for better fit
    icon: `mr-3 w-5 h-5 mt-1`,
    label: `block text-sm font-medium opacity-70 text-gray-400`,
    valueName: `text-lg font-bold text-gray-200`,
    // Ensured default values have consistent text size
    valueDefault: `text-gray-300 text-base`,
    // Push button to bottom and add a separator
    callButtonContainer: `mt-auto pt-4 border-t border-gray-600 flex justify-center`,
    callButton: `w-full max-w-lg h-[35px] flex items-center justify-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-small transition-colors duration-200`,
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-900 text-gray-300 h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-xl">Loading shop details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-red-400 min-h-screen">
        <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
        <p className="mb-2 text-xl font-medium">Error loading shop details:</p>
        <p className="text-center mb-4">{error.message}</p>
        <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
          Go Back to Sale Zone
        </button>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-gray-400 min-h-screen">
        <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
        <p className="mb-2 text-xl font-medium">No details found for this shop.</p>
        <p className="text-sm text-center mb-4">The shop ID `{id}` might be invalid or no data is available.</p>
        <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
          Go Back to Sale Zone
        </button>
      </div>
    );
  }

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
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
        aria-label="Go back to Sale Zone"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className={commonClasses.cardContainer}>
        <div className={commonClasses.cardContent}>
          <h2 className={commonClasses.heading}>Shop Details</h2>
          <div className={commonClasses.detailItem}>
            <img src={shopIcon} alt="Shop Icon" className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Name</label>
              <p className={commonClasses.valueName}>{shop.name}</p>
            </div>
          </div>
          <div className={commonClasses.detailItem}>
            <img src={addressIcon} alt="Address Icon" className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Address</label>
              <p className={commonClasses.valueDefault}>{shop.address || 'N/A'}</p>
            </div>
          </div>
          <div className={commonClasses.detailItem}>
            <img src={timeIcon} alt="Time Icon" className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Opening Hours</label>
              <ul className="space-y-1">
                {Object.entries(shop.openingHours).map(([day, hours]) => (
                  <li key={day} className="text-gray-300 text-sm">
                    <span className="font-medium">{day}:</span> {hours}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={commonClasses.detailItem}>
            <img src={postcodeIcon} alt="Postcode Icon" className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Postcode</label>
              <p className={commonClasses.valueDefault}>{shop.postcode || 'N/A'}</p>
            </div>
          </div>
          <div className={commonClasses.detailItem}>
            <img src={serviceTypeIcon} alt="Service Type Icon" className={commonClasses.icon} />
            <div>
              <label className={commonClasses.label}>Service Type</label>
              <p className={commonClasses.valueDefault}>{shop.serviceType || 'N/A'}</p>
            </div>
          </div>
          {/* Add more details as needed, they will scroll */}
        </div>
        <div className={commonClasses.callButtonContainer}>
          <button className={commonClasses.callButton}>
            <img src={phoneIcon} alt="Phone Icon" className="w-5h-5" />
            Call Shop Now
          </button>
        </div>
      </div>
      {/* Wrapper for CallHistory now also uses flex-1 to consume available height */}
      <div className="flex-1 flex flex-col min-w-0">
        <CallHistory isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default ShopDetailsPage;