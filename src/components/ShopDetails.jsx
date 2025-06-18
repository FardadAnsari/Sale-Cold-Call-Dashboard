// src/components/ShopDetails.jsx
import React from 'react';
import CallHistory from './CallHistory';

const ShopDetails = ({ shop, calls, isDarkMode }) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left Column - Shop Info */}
      <div className={`w-full md:w-1/2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <h2 className="text-xl font-semibold mb-4">Shop Details</h2>

        {/* Shop Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium opacity-70">Name</label>
          <p className="text-lg font-bold">{shop.name}</p>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium opacity-70">Address</label>
          <p>{shop.address || 'N/A'}</p>
        </div>

        {/* Opening Hours */}
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

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium opacity-70">Phone</label>
          <p>{shop.phone || 'N/A'}</p>
        </div>

        {/* Postcode */}
        <div className="mb-4">
          <label className="block text-sm font-medium opacity-70">Postcode</label>
          <p>{shop.postcode || 'N/A'}</p>
        </div>

        {/* Service Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium opacity-70">Service Type</label>
          <p>{shop.serviceType || 'N/A'}</p>
        </div>
      </div>

      {/* Right Column - Call History */}
      <div className={`w-full md:w-1/2 border-t md:border-t-0 md:border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-6 md:pt-0 md:pl-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <h3 className="text-xl font-semibold mb-4 text-orange-500">Call History</h3>

        {/* Sample Call Entries */}
        {calls.length > 0 ? (
          calls.map((call) => (
            <div key={call.id} className={`mb-6 p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
              {/* Called By & Date */}
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">
                  Called by <span className="text-orange-500">{call.caller}</span>
                </p>
                <p className="text-sm opacity-80">{call.timestamp}</p>
              </div>

              {/* Duration */}
              <div className="mb-3">
                <p className="text-sm">
                  <span className="font-medium">Duration:</span> {call.duration}
                </p>
              </div>

              {/* Contacted Via */}
              <div className="mb-3">
                <p className="text-sm">
                  <span className="font-medium">Contacted via:</span> {call.connectionMethod}
                </p>
              </div>

              {/* Caller Said */}
              <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border`}>
                <label className="block text-xs font-medium opacity-70 mb-1">Caller Said</label>
                <p className="text-sm">{call.transcript?.caller || 'No transcript available.'}</p>
              </div>

              {/* Owner Said */}
              <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'} border`}>
                <label className="block text-xs font-medium opacity-70 mb-1">Owner Said</label>
                <p className="text-sm">{call.transcript?.owner || 'No transcript available.'}</p>
              </div>

              {/* Call Result */}
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
  );
};

export default ShopDetails;