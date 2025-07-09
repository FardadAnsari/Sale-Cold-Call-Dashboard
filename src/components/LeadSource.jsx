// src/components/LeadSource.jsx
import React from 'react';
import SelectField from './SelectField'; // Ensure the path is correct

const LeadSource = () => {
    const leadSourceOptions = [
        'Advertisement',
        'Chat',
        'Cold Call',
        'Employee Referral',
        'Event',
        'External Referral',
        'Facebook',
        'Google+',
        'Mealzo Become a Partner',
        'Online Store',
        'Partner',
        'Public Relations',
        'Referral',
        'Sales Mail Alias',
        'Seminar Partner',
        'Seminar-Internal',
        'Trade Show',
        'Twitter',
        'Web',
        'Web Download',
        'Web Research',
        'WhatsApp - Mealzo Birmingham',
    ].sort(); // Keep the options sorted as they were in the original Lead.jsx

    return (
        <SelectField label="Lead Source" name="Lead_Source" options={leadSourceOptions} />
    );
};

export default LeadSource;