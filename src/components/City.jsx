import { useFormContext, Controller } from 'react-hook-form';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

const City = ({ defaultValue = null }) => {
  const { control } = useFormContext();

  const loadCityOptions = async (inputValue) => {
    if (inputValue.length < 2) return [];

    try {
      const res = await axios.get(
        `https://google.mega-data.co.uk/api/v1/companies/city-search/?city=${inputValue}`
      );
      return res.data
        .map((item) => item.district)
        .filter(Boolean)
        .map((district) => ({
          value: district,
          label: district,
        }));
    } catch (err) {
      console.error('City search failed:', err);
      return [];
    }
  };

  return (
    <div className='flex flex-col'>
      <label className='mb-1 block text-sm font-medium text-gray-400'>City Pick List</label>
      <Controller
        name='City_Pick_List'
        control={control}
        rules={{ required: 'City is required' }}
        render={({ field }) => (
          <AsyncSelect
            {...field}
            defaultValue={defaultValue}
            cacheOptions
            loadOptions={loadCityOptions}
            defaultOptions={false}
            placeholder='e.g. London'
            isClearable
            classNamePrefix='react-select'
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 2 ? 'Type at least 2 letters' : 'No matching cities'
            }
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#4B5563', // bg-gray-600
                borderColor: '#ffa202ff',
                color: '#F3F4F6', // text-gray-100
                minHeight: '43px',
              }),
              singleValue: (base) => ({
                ...base,
                color: '#F3F4F6',
              }),
              placeholder: (base) => ({
                ...base,
                color: '#424243ff', // placeholder-gray-400
              }),
              input: (base) => ({
                ...base,
                color: '#F3F4F6',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 10,
              }),
            }}
          />
        )}
      />
    </div>
  );
};

export default City;
