import Select from 'react-select/async';
import { default as StaticSelect } from 'react-select';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { IoMdRewind } from 'react-icons/io';

const ShopsFilter = ({ filters, setFilters, isDarkMode, onClose, onApply = () => {} }) => {
  const [postcodes, setPostcodes] = useState([]);
  const [loadingPostcodes, setLoadingPostcodes] = useState(false);


  const postcodeCache = useRef({}); // city => [postcodes]

  useEffect(() => {
    const city = filters.city;
    if (!city) {
      setPostcodes([]);
      return;
    }

    // Serve from cache
    if (postcodeCache.current[city]) {
      setPostcodes(postcodeCache.current[city]);
      return;
    }

    const fetchPostcodes = async () => {
      setLoadingPostcodes(true);
      try {
        const res = await axios.get(
          `https://google.mega-data.co.uk/api/v1/companies/postcode-search/?district=${city}`
        );
        console.log(res);
        const uniquePostcodes = [
          ...new Set(res.data.map((item) => item.postcode_area).filter(Boolean)),
        ];
        
        postcodeCache.current[city] = uniquePostcodes; // cache it
        setPostcodes(uniquePostcodes);
      } catch (err) {
        console.error('Postcode fetch failed:', err);
        setPostcodes([]);
      } finally {
        setLoadingPostcodes(false);
      }
    };

    fetchPostcodes();
  }, [filters.city]);

  const debounceRef = useRef(null);

  const loadCityOptions = (inputValue, callback) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (inputValue.length < 2) return callback([]);

      try {
        const res = await axios.get(
          `https://google.mega-data.co.uk/api/v1/companies/city-search/?city=${inputValue}`
        );
        console.log(res);
        const uniqueCities = [...new Set(res.data.map((item) => item.district).filter(Boolean))];
        callback(uniqueCities.map((district) => ({ value: district, label: district })));
      } catch (err) {
        console.error('City search failed:', err);
        callback([]);
      }
    }, 2000); // delay in ms
  };

  return (
    <div
      className={`w-100 max-w-sm rounded-md border-2 p-5 ${
        isDarkMode ? 'border-blue-400 bg-gray-800' : 'border-blue-500 bg-white'
      }`}
    >
      {/* City Select */}
      <div className='mb-4'>
        <label
          className={`mb-1 block text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Select a City
        </label>
        <Select
          loadOptions={(inputValue, callback) => loadCityOptions(inputValue, callback)}
          defaultOptions={false}
          cacheOptions
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              city: option?.value || '',
              postcode: '',
            }));
          }}
          value={filters.city ? { value: filters.city, label: filters.city } : null}
          placeholder='e.g. London'
          className='text-black'
          isClearable
        />
      </div>

      {/* Postcode Select */}
      <div className='mb-6'>
        <label
          className={`mb-1 block text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Select a Postcode
        </label>
        <StaticSelect
          options={postcodes.map((pc) => ({ value: pc, label: pc }))}
          value={filters.postcode ? { value: filters.postcode, label: filters.postcode } : null}
          onChange={(option) => {
            setFilters((prev) => ({
              ...prev,
              postcode: option?.value || '',
            }));
          }}
          placeholder='e.g. ML6'
          isClearable
          className='text-black'
          noOptionsMessage={() =>
            loadingPostcodes
              ? 'Loading postcodes...'
              : filters.city
                ? 'No postcodes found for this city.'
                : 'Please select a city first.'
          }
        />
      </div>

      <div className='flex justify-between gap-2'>
        {/* Apply Button */}
        <button
          onClick={() => {
            setFilters((prev) => ({ ...prev, postcode: '' }));
            onApply();
          }}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isDarkMode
              ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30'
          }`}
        >
          Apply
        </button>
        {/* Cancel Button */}
        <button
          onClick={onClose}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isDarkMode
              ? 'bg-gray-600 text-white hover:bg-gray-500'
              : 'bg-gray-300 text-black hover:bg-gray-400'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShopsFilter;
