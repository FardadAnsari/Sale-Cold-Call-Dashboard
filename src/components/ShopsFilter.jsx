import AsyncSelect from 'react-select/async';
import { default as StaticSelect } from 'react-select';
import axios from 'axios';
import { useState, useEffect, useRef, useMemo } from 'react';

const ShopsFilter = ({
  filters,
  setFilters,
  isDarkMode,
  onClose,
  onApply = () => {},
  city: cityProp,
  setCity: setCityProp,
  categoryOptions,
}) => {
  const [postcodes, setPostcodes] = useState([]);
  const [loadingPostcodes, setLoadingPostcodes] = useState(false);

  // Include "All" as the first/default option (value: '' -> falsy => omit from query)
  const CATEGORY_OPTIONS = useMemo(
    () =>
      categoryOptions ?? [
        { value: '', label: 'All' },
        { value: 'takeaway', label: 'Takeaway' },
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'cafe', label: 'Café' },
      ],
    [categoryOptions]
  );

  // Default category to "All" (empty string) if not present
  const categoryValue = filters.category ?? '';

  const selectedCity = (cityProp ?? filters.city ?? '').trim();

  const postcodeCache = useRef({});
  const debounceRef = useRef(null);

  const citySelected = Boolean(selectedCity);
  const postcodeRequired = citySelected;
  const postcodeMissing = postcodeRequired && !filters.postcode;

  useEffect(() => {
    if (!selectedCity) {
      setPostcodes([]);
      return;
    }

    if (postcodeCache.current[selectedCity]) {
      setPostcodes(postcodeCache.current[selectedCity]);
      return;
    }

    const fetchPostcodes = async () => {
      setLoadingPostcodes(true);
      try {
        const res = await axios.get(
          `https://google.mega-data.co.uk/api/v1/companies/postcode-search/?district=${encodeURIComponent(
            selectedCity
          )}`
        );
        const allPostcodes = res.data.map((item) => item.postcode_area).filter(Boolean);
        postcodeCache.current[selectedCity] = allPostcodes;
        setPostcodes(allPostcodes);
      } catch (err) {
        console.error('Postcode fetch failed:', err);
        setPostcodes([]);
      } finally {
        setLoadingPostcodes(false);
      }
    };

    fetchPostcodes();
  }, [selectedCity]);

  const loadCityOptions = (inputValue, callback) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!inputValue || inputValue.length < 2) return callback([]);

      try {
        const res = await axios.get(
          `https://google.mega-data.co.uk/api/v1/companies/city-search/?city=${encodeURIComponent(
            inputValue
          )}`
        );
        const allCities = res.data.map((item) => item.district).filter(Boolean);
        callback(allCities.map((district) => ({ value: district, label: district })));
      } catch (err) {
        console.error('City search failed:', err);
        callback([]);
      }
    }, 2000);
  };

  const handleCityChange = (option) => {
    const nextCity = option?.value || '';
    if (setCityProp) setCityProp(nextCity);
    setFilters((prev) => ({
      ...prev,
      city: nextCity,
      postcode: '',
    }));
  };

  return (
    <div
      className={`w-100 max-w-sm rounded-md border-2 p-5 ${
        isDarkMode ? 'border-blue-400 bg-gray-800' : 'border-blue-500 bg-white'
      }`}
    >
      {/* Category Select */}
      <div className='mb-4'>
        <label
          className={`mb-1 block text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          Category
        </label>
        <StaticSelect
          options={CATEGORY_OPTIONS}
          value={CATEGORY_OPTIONS.find((o) => o.value === categoryValue) ?? CATEGORY_OPTIONS[0]}
          onChange={(opt) => {
            // Set empty string for "All" so the caller can omit category from the endpoint
            const nextVal = opt?.value ?? '';
            setFilters((prev) => ({
              ...prev,
              category: nextVal,
            }));
          }}
          isClearable={false}
          className='text-black'
        />
      </div>

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
          <AsyncSelect
            loadOptions={loadCityOptions}
            defaultOptions={false}
            cacheOptions
            onChange={handleCityChange}
            value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
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
          isDisabled={!citySelected}
          styles={{
            control: (base) => ({
              ...base,
              borderColor: postcodeMissing ? '#ef4444' : base.borderColor,
              boxShadow: postcodeMissing ? '0 0 0 1px #ef4444' : base.boxShadow,
            }),
          }}
          noOptionsMessage={() =>
            loadingPostcodes
              ? 'Loading postcodes...'
              : citySelected
                ? 'No postcodes found for this city.'
                : 'Please select a city first.'
          }
        />
        {postcodeMissing && (
          <p className='mt-1 text-xs text-red-500'>Postcode is required when a city is selected.</p>
        )}
      </div>

      <div className='flex justify-between gap-2'>
        <button
          onClick={onApply}
          className={`rounded-md px-4 py-2 text-sm font-medium ${
            isDarkMode
              ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30'
              : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30'
          }`}
          disabled={postcodeMissing}
          title={postcodeMissing ? 'Select a postcode for the chosen city' : 'Apply filters'}
        >
          Apply
        </button>

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
