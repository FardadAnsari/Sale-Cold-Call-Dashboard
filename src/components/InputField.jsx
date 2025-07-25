// src/components/InputField.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form'; // Import useFormContext if you want to use it directly in InputField

const InputField = ({ label, required = false, name, type = "text", validationSchema = {} }) => {
  const { register, formState: { errors } } = useFormContext(); // Use useFormContext

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium mb-1 text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          className="w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm"
          {...register(name, {
            required: required ? "This field is required" : false,
            ...validationSchema
          })}
        />
        
      </div>
      {errors[name] && <span className="text-red-500 text-xs mt-1">{errors[name].message || "This field is required"}</span>}
    </div>
  );
};

export default InputField;