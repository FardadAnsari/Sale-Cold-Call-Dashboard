// src/components/InterestRate.jsx
import React from 'react';
import SelectField from './SelectField'; // Ensure the path is correct

const InterestRate = () => {
    const interestRateOptions = [
        '1',
        '2',
        '3',
        '4',
        '5'
    ];

    return (
        <SelectField label="Interest Rate" name="Interest_Rate" options={interestRateOptions} />
    );
};

export default InterestRate;