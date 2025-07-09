// src/components/SelectField.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form'; // Import useFormContext

const SelectField = ({ label, required = false, name, options = [], validationSchema = {} }) => {
  const { register, formState: { errors } } = useFormContext(); // Use useFormContext

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1 text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          className="w-full h-[43px] py-2 px-3 appearance-none border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 focus:border-orange-400 focus:ring-orange-400"
          {...register(name, {
            required: required ? "This field is required" : false,
            ...validationSchema
          })}
        >
          <option value="">None</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-orange-400">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name].message || "This field is required"}</span>}
    </div>
  );
};

export default SelectField;