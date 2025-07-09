import React from 'react';
import { useFormContext } from 'react-hook-form';

// List of UK cities (abbreviated list for illustration)
const ukCities = [
  'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool',
  'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Newcastle',
  'Leicester', 'Coventry', 'Southampton', 'Bradford', 'Cardiff',
  'Belfast', 'Nottingham', 'Kingston upon Hull', 'Stirling', 'Brighton'
];

const City = () => {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1 text-gray-400">
        City <span className="text-red-500">*</span>
      </label>
      <select
        {...register("City_Pick_List", { required: "City is required" })}
        className="w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm"
      >
        <option value="">Select a city...</option>
        {ukCities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
};

export default City;
