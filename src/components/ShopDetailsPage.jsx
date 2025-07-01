import React from 'react';
import { useParams, Link } from 'react-router-dom';
import mockShopData from '../mockData';
import CallHistory from './CallHistory';
import mockCallHistory from '../mockCallHistory'; // 

const ShopDetailsPage = ({ isDarkMode }) => {
  const { id } = useParams();
  const shop = mockShopData.find(shop => shop.id === parseInt(id));

  if (!shop) {
    return <div className="p-6">Shop not found.</div>;
  }

  const calls = mockCallHistory[shop.name] || []; // 

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="text-blue-500 hover:underline mb-4 inline-block"
        >
          &larr; Back to Shops
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Shop Info */}
          <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-4">Shop Details</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Name</label>
              <p className="text-lg font-bold">{shop.name}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Address</label>
              <p>{shop.address || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Opening Hours</label>
              <ul className="space-y-1">
                {Object.entries(shop.openingHours).map(([day, hours]) => (
                  <li key={day}>
                    <span className="font-medium">{day}:</span> {hours}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Phone</label>
              <p>{shop.phone || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Postcode</label>
              <p>{shop.postcode || 'N/A'}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium opacity-70">Service Type</label>
              <p>{shop.serviceType || 'N/A'}</p>
            </div>
          </div>

          {/* Right Column - Call History */}
          <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-xl font-semibold mb-4 text-orange-500">Call History</h3>

            {calls.length > 0 ? (
              calls.map((call) => (
                <div key={call.id} className={`mb-6 p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-medium">
                      Called by <span className="text-orange-500">{call.caller}</span>
                    </p>
                    <p className="text-sm opacity-80">{call.timestamp}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {call.duration}
                    </p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm">
                      <span className="font-medium">Contacted via:</span> {call.connectionMethod}
                    </p>
                  </div>

                  <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border`}>
                    <label className="block text-xs font-medium opacity-70 mb-1">Caller Said</label>
                    <p className="text-sm">{call.transcript?.caller || 'No transcript available.'}</p>
                  </div>

                  <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border`}>
                    <label className="block text-xs font-medium opacity-70 mb-1">Owner Said</label>
                    <p className="text-sm">{call.transcript?.owner || 'No transcript available.'}</p>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Call Result:</span> {call.result}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No call history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsPage;