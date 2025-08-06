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
        rules={{ required: false }}
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
              control: (base, state) => ({
                ...base,
                backgroundColor: '#4B5563',
                borderColor: state.isFocused ? '#fb923c' : '#4B5563',
                color: '#F3F4F6',
                minHeight: '43px',
                borderWidth: '1px',
                boxShadow: state.isFocused ? '0 0 0 1px #fb923c' : 'none',
                '&:hover': {
                  borderColor: '#fb923c',
                },
              }),
              singleValue: (base) => ({
                ...base,
                color: '#F3F4F6',
              }),
              placeholder: (base) => ({
                ...base,
                color: '#9CA3AF', // gray-400
              }),
              input: (base) => ({
                ...base,
                color: '#F3F4F6',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 10,
                backgroundColor: '#374151', // gray-700
                color: '#F3F4F6',
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected ? '#fb923c' : isFocused ? '#6B7280' : '#374151',
                color: isSelected || isFocused ? '#fff' : '#F3F4F6',
                cursor: 'pointer',
              }),
            }}
          />
        )}
      />
    </div>
  );
};

export default City;
