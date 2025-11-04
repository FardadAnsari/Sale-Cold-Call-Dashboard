import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TbSortAscending, TbSortDescending } from 'react-icons/tb';
import ShopDrawer from './ShopDrawer';

const Table = ({ shops = [], isDarkMode, ordering = [], setOrdering }) => {
  const [selectedShop, setSelectedShop] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  const handleSort = (field) => {
    let newOrdering = [...ordering];
    const ascIndex = newOrdering.indexOf(field);
    const descIndex = newOrdering.indexOf(`-${field}`);

    if (ascIndex !== -1) {
      newOrdering[ascIndex] = `-${field}`;
    } else if (descIndex !== -1) {
      newOrdering.splice(descIndex, 1);
    } else {
      newOrdering.push(field);
    }
    setOrdering(newOrdering);
  };

  const handleRowClick = (shop) => {
    setSelectedShop(shop);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedShop(null);
  };

  if (!shops.length) {
    return (
      <div
        className={`rounded-lg border p-6 text-center shadow-sm ${
          isDarkMode
            ? 'border-gray-700 bg-gray-800 text-gray-400'
            : 'border-gray-200 bg-white text-gray-500'
        }`}
      >
        <div className='bg-logo-pattern mb-4 flex h-40 w-full items-center justify-center rounded-md bg-cover bg-center'>
          <p className='rounded bg-black/60 px-4 py-2 text-sm text-white md:text-base'>
            No shops found. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-lg border shadow-sm ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}
      >
        {/* Desktop Table */}
        <div className='hidden overflow-x-auto md:block'>
          <table
            className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}
          >
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th
                  scope='col'
                  className={`text-l px-6 py-6 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Shop Name
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-center font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Postcode
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-left font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Service Type
                </th>
                <th
                  onClick={() => handleSort('rating')}
                  scope='col'
                  className={`px-6 py-3 text-center text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <div className='flex items-center justify-center'>
                    <span>Rating</span>
                    {ordering.includes('rating') && <TbSortAscending />}
                    {ordering.includes(`-rating`) && <TbSortDescending />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reviews')}
                  scope='col'
                  className={`px-6 py-3 text-center text-right font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  <div className='flex items-center justify-center'>
                    <span>Reviews</span>
                    {ordering.includes('reviews') && <TbSortAscending />}
                    {ordering.includes(`-reviews`) && <TbSortDescending />}
                  </div>
                </th>
                <th
                  scope='col'
                  className={`text-l px-6 py-3 text-center font-medium tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                >
                  Website
                </th>
              </tr>
            </thead>
            <tbody
              className={
                isDarkMode
                  ? 'divide-y divide-gray-700 bg-gray-800'
                  : 'divide-y divide-gray-200 bg-white'
              }
            >
              {shops.map((shop, index) => (
                <tr
                  key={shop.shop_id_GB}
                  onClick={() => handleRowClick(shop)}
                  className={`cursor-pointer ${index % 2 === 0 ? (isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50') : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                >
                  <td
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                  >
                    {shop.shop_name}
                  </td>
                  <td
                    className={`px-6 py-4 text-center font-mono text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {shop.postcode}
                  </td>
                  <td
                    className={`px-6 py-4 text-left text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {shop.services}
                  </td>
                  <td
                    className={`px-6 py-4 text-center font-mono text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {shop.rating}
                  </td>
                  <td
                    className={`px-6 py-4 text-center font-mono text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
                  >
                    {shop.reviews}
                  </td>

                  <td
                    className={`px-6 py-4 text-center text-sm whitespace-nowrap ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                  >
                    <a
                      href={shop.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                    >
                      {shop.website && shop.website !== 'None' ? 'Visit' : ''}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div
          className={`divide-y md:hidden ${isDarkMode ? 'divide-gray-700 text-gray-300' : 'divide-gray-200 text-gray-600'}`}
        >
          {shops.map((shop) => (
            <div
              key={shop.shop_id_GB}
              onClick={() => handleRowClick(shop)}
              className={`space-y-3 px-6 py-4 ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}
            >
              <div className='flex items-center justify-between'>
                <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {shop.shop_name}
                </h3>
              </div>
              <div className='flex justify-between'>
                <p className='text-sm'>{shop.postcode}</p>
              </div>
              <div className='text-right'>
                <a
                  href={shop.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500'
                  onClick={(e) => e.stopPropagation()}
                >
                  {shop.website && shop.website !== 'None' ? 'Visit' : ''}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ShopDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        isDarkMode={isDarkMode}
        shop={selectedShop}
      />
    </>
  );
};

export default Table;
