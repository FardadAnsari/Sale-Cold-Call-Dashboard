import Select from 'react-select/async';
import { default as StaticSelect } from 'react-select';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import AsyncSelect from 'react-select/async';

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
        const allPostcodes = res.data.map((item) => item.postcode_area).filter(Boolean);
        postcodeCache.current[city] = allPostcodes;
        setPostcodes(allPostcodes);
      } catch (err) {
        console.error('Postcode fetch failed:', err);
        setPostcodes([]);
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
        const allCities = res.data.map((item) => item.district).filter(Boolean);
        callback(allCities.map((district) => ({ value: district, label: district })));
      } catch (err) {
        console.error('City search failed:', err);
        callback([]);
      }
    }, 2000);
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
          Search a City
        </label>
        <div className='relative'>
          {/* <svg
            className={`pointer-events-none absolute top-1/2 left-3 z-10 h-5 w-5 translate-x-1 -translate-y-1/2 transform ${
              isDarkMode ? 'text-gray-300' : 'text-gray-400'
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg> */}
          <AsyncSelect
            loadOptions={loadCityOptions}
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
            noOptionsMessage={({ inputValue }) => (inputValue.length < 2 ? null : 'No options')}
          />
        </div>
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
          isDisabled={!filters.city}
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
          disabled={!filters.postcode}
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
