// src/components/LeadStatus.jsx
import React from 'react';
import SelectField from './SelectField'; // Ensure the path is correct

const LeadStatus = () => {
    const leadStatusOptions = [
        'Attempted to Contact',
        'Contact in Future',
        'Contacted',
        'Junk Lead',
        'Lost Lead',
        'Not Contacted',
        'Pre-Qualified',
        'Prospecting',
        'Not Qualified'
    ].sort(); // Sorting for consistent display

    return (
        <SelectField label="Lead Status" name="Lead_Status" options={leadStatusOptions} />
    );
};

export default LeadStatus;