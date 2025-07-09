// src/components/Industry.jsx
import React from 'react';
import SelectField from './SelectField'; // Ensure the path is correct based on your file structure

const Industry = () => {
    const industryOptions = [
        'Food and Beverage',
        'Retail',
        'Hospitality',
        'Professional Services',
        'Manufacturing',
        'Technology',
        'Education',
        'Healthcare',
        'Real Estate',
        'Financial Services',
        'Construction',
        'Automotive',
        'Media and Entertainment',
        'Telecommunications',
        'Transportation and Logistics',
        'Utilities',
        'Government',
        'Non-profit',
        'Agriculture',
        'Energy',
        'Other'
    ];

    return (
        <SelectField label="Industry" name="Industry" options={industryOptions} />
    );
};

export default Industry;