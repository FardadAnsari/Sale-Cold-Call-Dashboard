// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import CallHistory from './CallHistory';
// import shopIcon from '../images/shopicon.png';
// import addressIcon from '../images/address.png';
// import timeIcon from '../images/timeicon.png';
// import postcodeIcon from '../images/postcode.png';
// import serviceTypeIcon from '../images/Servicetype.png';
// import phoneIcon from '../images/phone.png';
// import sadMaskImg from '../images/sad-mask.png';

// // Helper to sanitize string values, replacing "None" or empty strings with default
// const sanitizeString = (value, defaultValue = 'N/A') => {
//   if (value === null || value === undefined || String(value).trim().toLowerCase() === 'none' || String(value).trim() === '') {
//     return defaultValue;
//   }
//   return String(value).trim();
// };

// // Helper to extract city from address string
// const extractCityFromAddress = (address) => {
//   const sanitizedAddress = sanitizeString(address, '');
//   if (!sanitizedAddress || sanitizedAddress === 'N/A') return 'Unknown';
//   const parts = sanitizedAddress.split(',');
//   return parts.length > 1 ? parts[parts.length - 2].trim() : 'Unknown';
// };

// // Helper to parse opening hours string/object - REVISED
// const parseOpeningHours = (openingHoursData) => {
//   const defaultHours = {
//     Monday: 'N/A', Tuesday: 'N/A', Wednesday: 'N/A',
//     Thursday: 'N/A', Friday: 'N/A', Saturday: 'N/A', Sunday: 'N/A'
//   };

//   if (typeof openingHoursData === 'object' && openingHoursData !== null) {
//     const parsed = {};
//     for (const day in defaultHours) {
//       const dayData = openingHoursData[day];
//       if (Array.isArray(dayData) && dayData.length > 0) {
//         // If it's an array of strings (e.g., ["9:00 AM - 5:00 PM"])
//         parsed[day] = dayData.map(hour => sanitizeString(hour, 'N/A')).join(', ');
//       } else if (typeof dayData === 'object' && dayData !== null && dayData.weekday_text && Array.isArray(dayData.weekday_text) && dayData.weekday_text.length > 0) {
//         // If it's an object containing a 'weekday_text' array (common for Google Places API detailed response)
//         // Extract the relevant part, e.g., "Tuesday: 11:00 AM – 10:00 PM" -> "11:00 AM – 10:00 PM"
//         const text = dayData.weekday_text[0]; // Assuming one entry per day
//         parsed[day] = sanitizeString(text.split(': ')[1] || text, 'N/A');
//       } else if (typeof dayData === 'object' && dayData !== null && (dayData.open || dayData.close)) {
//          // Fallback for simple {open: "time", close: "time"} objects, if any
//          const openTime = sanitizeString(dayData.open, '');
//          const closeTime = sanitizeString(dayData.close, '');
//          if (openTime === 'N/A' && closeTime === 'N/A') {
//            parsed[day] = 'Closed';
//          } else {
//            parsed[day] = `${openTime} - ${closeTime}`.trim();
//          }
//       } else {
//         parsed[day] = 'Closed'; // Default if no valid format found
//       }
//     }
//     return parsed;
//   }
//   return defaultHours;
// };

// // Helper to transform single shop API data
// const transformSingleShopData = (apiItem) => {
//   if (!apiItem) return null;
//   return {
//     id: apiItem.id || apiItem.shop_id_company,
//     name: sanitizeString(apiItem.shop_name, 'Unknown Shop'),
//     serviceType: sanitizeString(apiItem.category, 'Unknown'),
//     postcode: sanitizeString(apiItem.postcode, 'N/A'),
//     city: extractCityFromAddress(apiItem.address) || 'Unknown',
//     website: sanitizeString(apiItem.website, ''),
//     status: apiItem.is_open_now ? 'open' : 'closed',
//     address: sanitizeString(apiItem.address, ''),
//     phone: sanitizeString(apiItem.phone, ''),
//     rating: sanitizeString(apiItem.rating, 'N/A'),
//     total_reviews: apiItem.total_reviews || 0,
//     latitude: apiItem.latitude || '',
//     longitude: apiItem.longitude || '',
//     openingHours: parseOpeningHours(apiItem.opening_hours),
//     services: sanitizeString(apiItem.services, ''),
//     providers: apiItem.providers || [],
//     provider_url: sanitizeString(apiItem.provider_url, ''),
//     search_txt: sanitizeString(apiItem.search_txt, ''),
//     category: sanitizeString(apiItem.category, 'Unknown')
//   };
// };

// const ShopDetailsPage = ({ isDarkMode }) => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const {
//     data: shop,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ['singleShop', id],
//     queryFn: async () => {
//       if (!id) return null;
//       const url = `https://sale.mega-data.co.uk/google-map-data/?id=${id}`;
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: { 'accept': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status} for ID: ${id}`);
//       }
//       const data = await response.json();
//       if (data.results && Array.isArray(data.results) && data.results.length > 0) {
//         return transformSingleShopData(data.results[0]);
//       } else {
//         throw new Error(`Shop details not found or invalid response format for ID: ${id}`);
//       }
//     },
//     enabled: !!id,
//     staleTime: 5 * 60 * 1000,
//   });

//   const commonClasses = {
//     container: `flex flex-col lg:flex-row gap-6 p-6 w-[1190px] h-[900px] overflow-auto mx-auto relative`,
//     cardContainer: `flex-1 bg-gray-700 rounded-lg shadow-md p-6 flex flex-col min-w-0`,
//     cardContent: `flex-1 overflow-y-auto`,
//     heading: `text-xl font-semibold mb-4 text-gray-200`,
//     detailItem: `mb-5 flex items-start`,
//     icon: `mr-3 w-6 h-6 mt-1`,
//     label: `block text-sm font-medium opacity-70 text-gray-400`,
//     valueName: `text-lg font-bold text-gray-200`,
//     valueDefault: `text-gray-300`,
//     callButtonContainer: `mt-6 flex justify-center`,
//     callButton: `w-full max-w-sm h-[44px] flex items-center justify-center gap-2 px-4 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors duration-200`,
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-1 items-center justify-center bg-gray-900 text-gray-300 h-full">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
//         <p className="text-xl">Loading shop details...</p>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-red-400 h-full">
//         <img src={sadMaskImg} alt="Error" className="w-32 h-32 mb-4" />
//         <p className="mb-2 text-xl font-medium">Error loading shop details:</p>
//         <p className="text-center mb-4">{error.message}</p>
//         <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
//           Go Back to Sale Zone
//         </button>
//       </div>
//     );
//   }

//   if (!shop) {
//     return (
//       <div className="flex flex-col flex-1 items-center justify-center p-8 bg-gray-900 text-gray-400 h-full">
//         <img src={sadMaskImg} alt="Sad Mask" className="w-32 h-32 mb-4" />
//         <p className="mb-2 text-xl font-medium">No details found for this shop.</p>
//         <p className="text-sm text-center mb-4">The shop ID `{id}` might be invalid or no data is available.</p>
//         <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded transition-colors">
//           Go Back to Sale Zone
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className={commonClasses.container}>
//       {/* Back Button (Left-pointing arrow) on top-left */}
//       <button
//         onClick={() => navigate('/')}
//         className="absolute top-4 left-4 z-10 p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
//         aria-label="Go back to Sale Zone"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /> {/* This is the left-pointing arrow */}
//         </svg>
//       </button>

//       {/* Shop Details Card */}
//       <div className={commonClasses.cardContainer}>
//         {/* Scrollable Content Area */}
//         <div className={commonClasses.cardContent}>
//           <h2 className={commonClasses.heading}>Shop Details</h2>

//           {/* Shop Name */}
//           <div className={commonClasses.detailItem}>
//             <img src={shopIcon} alt="Shop Icon" className={commonClasses.icon} />
//             <div>
//               <label className={commonClasses.label}>Name</label>
//               <p className={commonClasses.valueName}>{shop.name}</p>
//             </div>
//           </div>

//           {/* Address */}
//           <div className={commonClasses.detailItem}>
//             <img src={addressIcon} alt="Address Icon" className={commonClasses.icon} />
//             <div>
//               <label className={commonClasses.label}>Address</label>
//               <p className={commonClasses.valueDefault}>{shop.address || 'N/A'}</p>
//             </div>
//           </div>

//           {/* Opening Hours */}
//           <div className={commonClasses.detailItem}>
//             <img src={timeIcon} alt="Time Icon" className={commonClasses.icon} />
//             <div>
//               <label className={commonClasses.label}>Opening Hours</label>
//               <ul className="space-y-1">
//                 {Object.entries(shop.openingHours).map(([day, hours]) => (
//                   <li key={day} className="text-gray-300">
//                     <span className="font-medium">{day}:</span> {hours}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Postcode */}
//           <div className={commonClasses.detailItem}>
//             <img src={postcodeIcon} alt="Postcode Icon" className={commonClasses.icon} />
//             <div>
//               <label className={commonClasses.label}>Postcode</label>
//               <p className={commonClasses.valueDefault}>{shop.postcode || 'N/A'}</p>
//             </div>
//           </div>

//           {/* Service Type */}
//           <div className={commonClasses.detailItem}>
//             <img src={serviceTypeIcon} alt="Service Type Icon" className={commonClasses.icon} />
//             <div>
//               <label className={commonClasses.label}>Service Type</label>
//               <p className={commonClasses.valueDefault}>{shop.serviceType || 'N/A'}</p>
//             </div>
//           </div>
//         </div>

//         {/* Centered Call Button at Bottom */}
//         <div className={commonClasses.callButtonContainer}>
//           <button className={commonClasses.callButton}>
//             <img src={phoneIcon} alt="Phone Icon" className="w-5 h-5" />
//             Call Shop Now
//           </button>
//         </div>
//       </div>

//       {/* Right Column - Call Summary Form */}
//       <div className="w-full lg:w-auto flex-1 min-h-[500px] lg:min-h-0">
//         <CallHistory isDarkMode={isDarkMode} />
//       </div>
//     </div>
//   );
// };

// export default ShopDetailsPage;
