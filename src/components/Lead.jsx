import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import plusPng from "../images/Plus.png"
import vectorIcon from '../images/Vector.png';
import deleteContainerIcon from '../images/DeleteContainer.png';
import lockPng from '../images/lock.png';
// Import the reusable components
import InputField from './InputField';
import SelectField from './SelectField';
import Area from './Area';
import Industry from './Industry';
import LeadSource from './LeadSource';
import InterestRate from './InterestRate';
import LeadStatus from './LeadStatus';
import Stage from './Stage';
// AccordionSection component for collapsible sections
const AccordionSection = ({ title, children, isOpen, onToggle }) => (
  <div className="mb-6"> {/* Added margin-bottom here */}
    <div className="flex justify-between items-center cursor-pointer pb-4 mb-4 border-b border-gray-600" onClick={onToggle}>
      <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
      <svg className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
      </svg>
    </div>
    {isOpen && <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>}
  </div>
);
// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required.';
  } else if (!emailRegex.test(email)) {
    return 'Invalid email address. Please try again.';
  }
  return true;
};
const Lead = () => {
  // useForm hook for form state management and validation
  const authToken = sessionStorage.getItem("authToken")

  const methods = useForm({ // Renamed to methods for FormProvider
    defaultValues: {
      Company: '',
      Previous_Name: '',
      Company_Registered_Name: '',
      phoneNumbers: [''],
      Title: '',
      First_Name: '',
      Last_Name: '',
      Mobile: '',
      Email: '',
      Website: '', // Added Website to defaultValues
      Lead_Status: '',
      stage: '',
      Lead_Source: '',
      Industry: '',
      Sales_Participants: '',
      Area: '',
      Interest_Rate: '',
      Last_Caller: '',
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      leadOwnerEmail: '',
      Street: '',
      City_Pick_List: '',
      State: '',
      Zip_Code: '',
      Country: '',
      Latitude: '',
      Longitude: '',
      Description: '',
      Internet_Connection_Status: '',
      Master_Socket_To_Counter: '',
      Premises_Condition: '',
      // businessStartDate: '',
      Land_Line_Provider: '',
      Land_Line_Type: '',
      hasKitchenPrinter: false,
    }
  });
  const { handleSubmit, setValue, watch, reset } = methods; // Destructure only what's needed directly in Lead
  // State to manage the open/closed status of each accordion section
  const [sections, setSections] = useState({
    isLeadInfoOpen: false, // 
    isAddressOpen: false,
    isDescriptionOpen: false,
    isInstallationTeamOpen: false,
  });
  // State for submission status and loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ error: null, success: null });
  // Watch phoneNumbers field for dynamic rendering of phone inputs
  const phoneNumbers = watch('phoneNumbers');
  // Function to clear input field value (now uses setValue from methods)
  const handleClear = (field) => {
    setValue(field, '', { shouldValidate: true });
  };
  // Function to add a new phone number input field
  const handleAddPhoneNumber = () => {
    if (phoneNumbers.length < 2) {
      setValue('phoneNumbers', [...phoneNumbers, ''], { shouldValidate: true });
    } else {
      console.warn('You can only add up to 2 phone numbers (Phone and Phone2).');
      setSubmitStatus({ error: 'You can only add up to 2 phone numbers (Phone and Phone2).', success: null });
    }
  };
  // Function to remove a phone number input field
  const handleRemovePhoneNumber = (index) => {
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setValue('phoneNumbers', newPhoneNumbers.length > 0 ? newPhoneNumbers : [''], { shouldValidate: true });
  };
  // Function to format date and time into ISO 8601 string
  const formatDateTimeForAPI = (date, time) => {
    if (!date && !time) {
      console.log("formatDateTimeForAPI: Both date and time are empty, returning ''.");
      return '';
    }
    try {
      let dateString;
      if (date && time) {
        dateString = `${date}T${time}:00.000Z`;
      } else if (date) {
        dateString = `${date}T00:00:00.000Z`;
      } else if (time) {
        const today = new Date().toISOString().split('T')[0];
        dateString = `${today}T${time}:00:00.000Z`;
      } else {
        console.warn("formatDateTimeForAPI: Unexpected scenario, returning empty string.");
        return '';
      }
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
        console.error("formatDateTimeForAPI: Created an invalid Date object, returning ''. Input:", { date, time });
        return '';
      }
      const isoString = d.toISOString();
      console.log(`formatDateTimeForAPI: Converted {date: ${date}, time: ${time}} to ISO string: ${isoString}`);
      return isoString;
    } catch (e) {
      console.error("Error formatting date/time in formatDateTimeForAPI:", e);
      return '';
    }
  };
  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ error: null, success: null });
    const authToken = sessionStorage.getItem('authToken'); // Changed to sessionStorage
    if (!authToken) {
      setSubmitStatus({ error: 'Authentication token not found. Please log in again.', success: null });
      setIsSubmitting(false);
      return;
    }
    // Format date/time fields to ISO 8601 strings as required by backend
    const nextFollowUpFormatted = formatDateTimeForAPI(data.nextFollowUpDate, data.nextFollowUpTime);
    const businessStartDateFormatted = formatDateTimeForAPI(data.businessStartDate, null);
    // Filter out empty phone numbers
    const cleanPhoneNumbers = data.phoneNumbers.filter(phone => phone && phone.trim() !== '');
    // Construct the leadData object matching the backend's exact schema
    const leadData = {
      Owner: {
        email: data.leadOwnerEmail,
      },
      // Tag: [
      //   {
      //     name: "Onboarding Zone App",
      //     id: "458329000059988037"
      //   }
      // ],
      Company: data.Company,
      Previous_Name: data.Previous_Name,
      Company_Registered_Name: data.Company_Registered_Name,
      Phone: cleanPhoneNumbers[0] || "",
      Phone2: cleanPhoneNumbers[1] || "",
      //Salutation: data.Title,
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      Mobile: data.Mobile,
      Email: data.Email,
      //Website: data.Website, // Added Website to the payload
      Lead_Status: data.Lead_Status,
      stage: data.stage,
      Lead_Source: data.Lead_Source,
      Industry: data.Industry,
      Area: data.Area,
      Interest_Rate: data.Interest_Rate,
      //Last_Caller: data.Last_Caller,
      //Next_Follow_Up: nextFollowUpFormatted,
      Lead_Owner: data.leadOwnerEmail,
      Street: data.Street,
      City_Pick_List: data.City_Pick_List,
      State: data.State,
      Zip_Code: data.Zip_Code,
      Country: data.Country,
      Latitude: data.Latitude,
      Longitude: data.Longitude,
      Description: data.Description,
      Internet_Connection_Status: data.Internet_Connection_Status,
      //Master_Socket_To_Counter: data.Master_Socket_To_Counter,
      Premises_Condition: data.Premises_Condition,
      Business_Start_Date: businessStartDateFormatted,
      Has_Kitchen_Printer: Boolean(data.hasKitchenPrinter),
      Land_Line_Provider: data.Land_Line_Provider,
      Land_Line_Type: data.Land_Line_Type
    };
    const leadPayload = {
      data: [leadData],
      // apply_feature_execution: [
      //   {
      //     name: "layout_rules"
      //   }
      // ],
      skip_feature_execution: [],
      trigger: []
    };
    // Log the JSON body to the console
    console.log('JSON Payload:', JSON.stringify(leadPayload, null, 2));
    try {
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'csrftoken') {
            return value;
          }
        }
        return null;
      };
      const csrfToken = getCsrfToken();
      const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      };
      if (csrfToken) {
        headers['X-CSRFTOKEN'] = csrfToken;
      }
      console.log('Request headers:', headers);
      const response = await fetch('https://sale.mega-data.co.uk/zoho/create-lead', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(leadPayload)
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Lead created successfully:', result);
        setSubmitStatus({ error: null, success: 'Lead created successfully!' });
        reset();
        setSections({
          isLeadInfoOpen: false,
          isAddressOpen: false,
          isDescriptionOpen: false,
          isInstallationTeamOpen: false,
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to create lead:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        let errorMessage = 'An error occurred while creating the lead.';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (response.status === 400) {
          if (errorData.data && Array.isArray(errorData.data) && errorData.data.length > 0 && errorData.data[0].details) {
            const fieldErrors = errorData.data[0].details;
            errorMessage = 'Validation Error: ';
            for (const field in fieldErrors) {
              errorMessage += `${field}: ${fieldErrors[field].join(', ')}. `;
            }
          } else {
            errorMessage = 'Bad Request: Please check your form data. Missing or invalid required fields.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized: Please check your authentication token.';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: You do not have permission to perform this action.';
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        setSubmitStatus({ error: errorMessage, success: null });
      }
    } catch (error) {
      console.error('Network or submission error:', error);
      setSubmitStatus({ error: 'Could not connect to the server. Please check your internet connection and try again.', success: null });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Function to toggle accordion section visibility
  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  // Tailwind CSS classes for consistent styling
  const formClasses = {
    container: `bg-gray-700 rounded-lg shadow-md p-6 mt-6`,
    addNumberButton: `flex items-center justify-center px-4 py-2 border border-white rounded-md text-white text-sm font-medium transition-colors duration-200 bg-gray-800 hover:bg-gray-700 whitespace-nowrap ml-2 h-[43px]`,
    dateInput: `w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm`,
    timeInput: `w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm`,
    lockIcon: `absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5`,
    textareaBase: `w-full md:w-[530px] h-[185px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm resize-none`,
    checkboxWrapper: `flex items-center mt-2`,
    checkboxInput: `h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-600 rounded-sm bg-gray-600`,
    checkboxLabel: `block text-sm text-gray-400 mr-2`,
  };
  const titleOptions = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.']; // Options for the title dropdown
  // Options for Last Caller, including 'Frank' for testing
  const lastCallerOptions = ['Frank']; // Add 'Frank' for testing purposes, you can add more names here if needed
  return (
    <FormProvider {...methods}> {/* Wrap the form with FormProvider */}
      <form className={formClasses.container} onSubmit={handleSubmit(onSubmit)}>
        <AccordionSection
          title="Lead Information"
          isOpen={sections.isLeadInfoOpen}
          onToggle={() => toggleSection('isLeadInfoOpen')}
        >
          <InputField label="Company" required name="Company" onClear={() => handleClear('Company')} />
          <InputField label="Previous Name" name="Previous_Name" onClear={() => handleClear('Previous_Name')} />
          <div className="flex flex-col col-span-full">
            <InputField label="Company Registered Name" name="Company_Registered_Name" onClear={() => handleClear('Company_Registered_Name')} />
          </div>
          <div className="flex flex-col col-span-full">
            <label className="block text-sm font-medium mb-1 text-gray-400">Phone</label>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              {phoneNumbers.map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="relative flex items-center w-80">
                    <input
                      type="text"
                      className="w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm"
                      {...methods.register(`phoneNumbers.${index}`)}
                    />
                    {watch(`phoneNumbers.${index}`) && (
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer text-lg font-bold" onClick={() => methods.setValue(`phoneNumbers.${index}`, '', { shouldValidate: true })}>x</button>
                    )}
                  </div>
                  {phoneNumbers.length > 1 && (
                    <button type="button" className="flex items-center justify-center w-10 h-[43px] rounded-md transition-colors duration-200 bg-gray-600 hover:bg-gray-700" onClick={() => handleRemovePhoneNumber(index)}>
                      <img src={deleteContainerIcon} alt="Delete" className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={formClasses.addNumberButton} onClick={handleAddPhoneNumber}>
                <img src={plusPng} alt="Add" className="h-4 w-4 mr-1" /> Add Phone
              </button>
            </div>
          </div>
          {/* Combined Title and First Name fields */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">First Name</label>
            <div className="flex space-x-2"> {/* Added flex container for alignment */}
              <div className="w-1/3"> {/* Adjust width as needed */}
                <SelectField label="" name="Title" options={titleOptions} includeNone={true} />
              </div>
              <div className="w-2/3"> {/* Adjust width as needed */}
                <InputField label="" name="First_Name" onClear={() => handleClear('First_Name')} hideLabel={true} />
              </div>
            </div>
          </div>
          <InputField label="Last Name" required name="Last_Name" onClear={() => handleClear('Last_Name')} />
          <InputField label="Mobile" name="Mobile" onClear={() => handleClear('Mobile')} />
          <InputField
            label="Email"
            type="email"
            name="Email"
            onClear={() => handleClear('Email')}
            validationSchema={{ validate: validateEmail }}
          />
          {/* Added Website text field here, before LeadStatus */}
          <InputField label="Website" name="Website" onClear={() => handleClear('Website')} />
          <LeadStatus /> {/* Use the LeadStatus component */}
          <Stage /> {/* Use the Stage component */}
          <LeadSource /> {/* Uses the LeadSource component */}
          <Industry /> {/* Uses the Industry component */}
          <Area /> {/* Uses the Area component */}
          <InterestRate /> {/* Uses the InterestRate component */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">Last Caller</label>
            <div className="flex items-center rounded-md overflow-hidden border border-gray-600">
              <div className="relative flex-grow">
                <select
                  className="w-full h-[43px] py-2 px-3 appearance-none focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 focus:border-orange-400 focus:ring-orange-400 border-r border-gray-600"
                  {...methods.register('Last_Caller')}
                >
                  <option value="">None</option> {/* Default "None" option */}
                  {lastCallerOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-orange-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button type="button" className="flex-shrink-0 flex items-center justify-center w-10 h-[43px] bg-gray-300 text-gray-800 hover:bg-gray-400">
                <img src={vectorIcon} alt="Add" className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">Next Follow Up Date</label>
             <input type="date" className={formClasses.dateInput} {...methods.register('nextFollowUpDate')} placeholder="MMM D, YYY" />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">Next Follow Up Time</label>
             <input type="time" className={formClasses.timeInput} {...methods.register('nextFollowUpTime')} placeholder="HH:MM AM/PM" />
          </div>
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">Lead Owner Email</label>
            <div className="flex items-center rounded-md overflow-hidden border border-gray-600">
              <div className="relative flex-grow">
                <input
                  type="email"
                  className="w-full h-[43px] py-2 px-3 focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 focus:border-orange-400 focus:ring-orange-400 border-r border-gray-600"
                  {...methods.register('leadOwnerEmail', { validate: validateEmail, required: "Lead Owner Email is required" })}
                  placeholder="owner@example.example.com"
                />
              </div>
              <button type="button" className="flex-shrink-0 flex items-center justify-center w-10 h-[43px] bg-gray-300 text-gray-800 hover:bg-gray-400">
                <img src={vectorIcon} alt="Add" className="h-5 w-5" />
              </button>
            </div>
            {methods.formState.errors.leadOwnerEmail && <span className="text-red-500 text-xs mt-1">{methods.formState.errors.leadOwnerEmail.message}</span>}
          </div>
        </AccordionSection>
        <AccordionSection
          title="Address Information"
          isOpen={sections.isAddressOpen}
          onToggle={() => toggleSection('isAddressOpen')}
        >
          <InputField label="Street" name="Street" onClear={() => handleClear('Street')} />
          <SelectField label="City Pick List" name="City_Pick_List" options={['London', 'Manchester', 'Birmingham', 'Other']} />
          <InputField label="State" name="State" onClear={() => handleClear('State')} />
          <InputField label="Zip Code" name="Zip_Code" onClear={() => handleClear('Zip_Code')} />
          <InputField label="Country" name="Country" onClear={() => handleClear('Country')} />
          <InputField label="Latitude" name="Latitude" onClear={() => handleClear('Latitude')} />
          <InputField label="Longitude" name="Longitude" onClear={() => handleClear('Longitude')} />
        </AccordionSection>
        <AccordionSection
          title="Description Information"
          isOpen={sections.isDescriptionOpen}
          onToggle={() => toggleSection('isDescriptionOpen')}
        >
          <div className="flex flex-col col-span-full">
            <label className="block text-sm font-medium mb-1 text-gray-400">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className={formClasses.textareaBase}
              {...methods.register('Description', { required: "Description is required" })}
            ></textarea>
            {methods.formState.errors.Description && <span className="text-red-500 text-xs mt-1">{methods.formState.errors.Description.message}</span>}
          </div>
        </AccordionSection>
        <AccordionSection
          title="Installation Team"
          isOpen={sections.isInstallationTeamOpen}
          onToggle={() => toggleSection('isInstallationTeamOpen')}
        >
          <InputField
            label="Internet Connection Status"
            required
            name="Internet_Connection_Status"
            onClear={() => handleClear('Internet_Connection_Status')}
          />
          <SelectField
            label="Master Socket To Counter"
            name="Master_Socket_To_Counter"
            options={['None', '0-5m', '5-10m', '10m+']}
          />
          <div className="flex flex-col">
            <label className="block text-sm font-medium mb-1 text-gray-400">
              Premises Condition <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                className="w-full h-[43px] py-2 px-3 font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400 placeholder:text-sm"
                {...methods.register('Premises_Condition', { required: "Premises Condition is required" })}
              />
              <img src={lockPng} alt="Lock" className={formClasses.lockIcon} />
            </div>
            {methods.formState.errors.Premises_Condition && <span className="text-red-500 text-xs mt-1">{methods.formState.errors.Premises_Condition.message}</span>}
          </div>
           <InputField
            label="Business Start Date"
            type="date"
            name="businessStartDate"
            onClear={() => handleClear('businessStartDate')}
          />
          <InputField
            label="Land Line Provider"
            required={false}
            name="Land_Line_Provider"
            onClear={() => handleClear('Land_Line_Provider')}
          />
          <InputField
            label="Land Line Type"
            required={false}
            name="Land_Line_Type"
            onClear={() => handleClear('Land_Line_Type')}
          />
          <div className={formClasses.checkboxWrapper}>
            <label htmlFor="hasKitchenPrinter" className={formClasses.checkboxLabel}>
              Has Kitchen Printer
            </label>
            <input
              type="checkbox"
              id="hasKitchenPrinter"
              className={formClasses.checkboxInput}
              {...methods.register('hasKitchenPrinter')}
            />
          </div>
        </AccordionSection>
        <div className="mt-6 text-center">
          {submitStatus.error && <p className="text-red-500">{submitStatus.error}</p>}
          {submitStatus.success && <p className="text-green-500">{submitStatus.success}</p>}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};
export default Lead;
