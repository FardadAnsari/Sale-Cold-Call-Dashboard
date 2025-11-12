import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import lockPng from '../images/lock.png';
import InputField from './InputField';
import SelectField from './SelectField';
// import Area from './Area';
import Industry from './Industry';
import LeadSource from './LeadSource';
import InterestRate from './InterestRate';
import LeadStatus from './LeadStatus';
import Stage from './Stage';
import useUser from 'src/useUser';
import { API_BASE_URL } from 'src/api';
import axios from 'axios';
import City from './City';

// AccordionSection component
const AccordionSection = ({ title, children, isOpen, onToggle }) => (
  <div className='mb-2 rounded-lg border border-gray-600 bg-gray-800 p-4'>
    <div className='flex cursor-pointer items-center justify-between' onClick={onToggle}>
      <h2 className='text-lg font-semibold text-gray-200'>{title}</h2>
      <svg
        className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill='currentColor'
        viewBox='0 0 20 20'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          fillRule='evenodd'
          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
          clipRule='evenodd'
        ></path>
      </svg>
    </div>
    {isOpen && <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>{children}</div>}
  </div>
);

// Email validation function
const validateEmail = (email) => {
  if (!email) return true; // Allow empty value
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? true : 'Invalid email address. Please try again.';
};

const UpdateLead = ({ leadData = {} }) => {
  const { data: user } = useUser();
  // console.log(user);
  // console.log(leadData);

  const methods = useForm({
    defaultValues: {
      Company: leadData.Company || '',
      Previous_Name: leadData.Previous_Name || '',
      Company_Registered_Name: leadData.Company_Registered_Name || '',
      Phone: leadData.Phone || '',
      Phone_2: leadData.Phone_2 || '',
      Title: leadData.Salutation || '',
      First_Name: leadData.First_Name || '',
      Last_Name: leadData.Last_Name || '',
      Mobile: leadData.Mobile || '',
      Email: leadData.Email || '',
      Website: leadData.Website || '',
      Lead_Status: leadData.Lead_Status || '',
      Stage: leadData.Stage || '',
      Lead_Source: leadData.Lead_Source || '',
      Industry: leadData.Industry || '',
      Sales_Participants: leadData.Sales_Participants || '',
      // Area: leadData.Area || '',
      Interest_Rate: leadData.Interest_Rate || '',
      Street: leadData.Street || '',
      City_Pick_List: leadData.City_Pick_List || '',
      State: leadData.State || '',
      Zip_Code: leadData.Zip_Code || '',
      Country: leadData.Country || '',
      Latitude: leadData.Latitude || '',
      Longitude: leadData.Longitude || '',
      Description: leadData.Description || '',
      Internet_Connection_Status: leadData.Internet_Connection_Status || '',
      Master_Socket_To_Counter: leadData.Master_Socket_To_Counter || '',
      Premises_Condition: leadData.Premises_Condition || '',
      businessStartDate: leadData.Business_Start_Date || '',
      Land_Line_Provider: leadData.Land_Line_Provider || '',
      Land_Line_Type: leadData.Land_Line_Type || '',
      hasKitchenPrinter: leadData.Has_Kitchen_Printer || false,
    },
  });

  const { reset, setValue } = methods;

  useEffect(() => {
    if (leadData && Object.keys(leadData).length > 0) {
      const defaultValues = {
        ...leadData,
        hasKitchenPrinter: Boolean(leadData.Has_Kitchen_Printer),
      };
      reset(defaultValues);
      if (leadData.City_Pick_List) {
        setValue('City_Pick_List', {
          label: leadData.City_Pick_List,
          value: leadData.City_Pick_List,
        });
      }
    }
  }, [leadData, reset, setValue]);

  const { handleSubmit } = methods;
  const [sections, setSections] = useState({
    isLeadInfoOpen: true, // Open by default
    isAddressOpen: true, // Open by default
    isDescriptionOpen: true, // Open by default
    isInstallationTeamOpen: true, // Open by default
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ error: null, success: null });

  const handleClear = (field) => {
    setValue(field, '', { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus({ error: null, success: null });
    const authToken = sessionStorage.getItem('authToken');
    if (!authToken) {
      setSubmitStatus({
        error: 'Authentication token not found. Please log in again.',
        success: null,
      });
      setIsSubmitting(false);
      return;
    }

    const leadData = {
      Owner: {
        email: user.email,
      },
      Tag: [
        {
          name: 'Onboarding Zone App',
          id: '458329000059988037',
        },
      ],
      Company: data.Company,
      Previous_Name: data.Previous_Name,
      Company_Registered_Name: data.Company_Registered_Name,
      Phone: data.Phone || '',
      Phone_2: data.Phone_2 || '',
      //Salutation: data.Title,
      First_Name: data.First_Name,
      Last_Name: data.Last_Name,
      Mobile: data.Mobile,
      Email: data.Email,
      Website: data.Website,
      Lead_Status: data.Lead_Status,
      Stage: data.Stage,
      Lead_Source: data.Lead_Source,
      Industry: data.Industry,
      // Area: data.Area,
      Interest_Rate: data.Interest_Rate,
      //Last_Caller: data.Last_Caller,
      // Next_Follow_Up: nextFollowUpFormatted,
      Lead_Owner: user.email,
      Street: data.Street,
      City_Pick_List:
        data.City_Pick_List &&
        typeof data.City_Pick_List === 'object' &&
        'value' in data.City_Pick_List
          ? data.City_Pick_List.value
          : data.City_Pick_List,
      State: data.State,
      Zip_Code: data.Zip_Code,
      Country: data.Country,
      Latitude: data.Latitude,
      Longitude: data.Longitude,
      Description: data.Description,
      Internet_Connection_Status: data.Internet_Connection_Status,
      Master_Socket_To_Counter: data.Master_Socket_To_Counter,
      Premises_Condition: data.Premises_Condition,
      // Business_Start_Date: businessStartDateFormatted,
      Has_Kitchen_Printer: Boolean(data.hasKitchenPrinter),
      Land_Line_Provider: data.Land_Line_Provider,
      Land_Line_Type: data.Land_Line_Type,
    };

    const leadPayload = {
      data: [leadData],
      // apply_feature_execution: [
      //   {
      //     name: "layout_rules"
      //   }
      // ],
      skip_feature_execution: [],
      trigger: [],
    };

    console.log('JSON Payload:', JSON.stringify(leadPayload, null, 2));

    try {
      const headers = {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      };

      console.log('Request headers:', headers);
      const response = await axios.post(`${API_BASE_URL}/zoho/create-lead/`, leadPayload, {
        headers: headers,
      });
      console.log(response);

      if (response.status === 200) {
        const result = response.data;
        console.log('Lead updated successfully:', result);
        setSubmitStatus({ error: null, success: 'Lead updated successfully!' });
        reset();
        setSections({
          isLeadInfoOpen: true,
          isAddressOpen: true,
          isDescriptionOpen: true,
          isInstallationTeamOpen: true,
        });
      }
    } catch (error) {
      console.error('Network or submission error:', error);

      let errorMessage =
        'Could not connect to the server. Please check your internet connection and try again.';

      if (error.response) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (status === 400) {
          if (
            errorData.data &&
            Array.isArray(errorData.data) &&
            errorData.data.length > 0 &&
            errorData.data[0].details
          ) {
            const fieldErrors = errorData.data[0].details;
            errorMessage = 'Validation Error: ';
            for (const field in fieldErrors) {
              errorMessage += `${field}: ${fieldErrors[field].join(', ')}. `;
            }
          } else {
            errorMessage = 'Bad Request: Please check your form data.';
          }
        } else if (status === 401) {
          errorMessage = 'Unauthorized: Please check your authentication token.';
        } else if (status === 403) {
          errorMessage = 'Forbidden: You do not have permission to perform this action.';
        } else {
          errorMessage = `Error ${status}: ${error.response.statusText}`;
        }
      }

      setSubmitStatus({ error: errorMessage, success: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <FormProvider {...methods}>
      <div className='flex h-full flex-col'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex h-full flex-col'>
          {/* Legal Information Section */}
          <div className='flex-1 space-y-6 overflow-y-auto'>
            <div className='mx-2 rounded-lg bg-gray-800'>
              {/* Lead Information */}
              <AccordionSection
                title='Lead Information'
                isOpen={sections.isLeadInfoOpen}
                onToggle={() => toggleSection('isLeadInfoOpen')}
              >
                <InputField
                  label='Company'
                  required
                  name='Company'
                  onClear={() => handleClear('Company')}
                />
                <InputField
                  label='Previous Name'
                  name='Previous_Name'
                  onClear={() => handleClear('Previous_Name')}
                />
                <div className='col-span-full flex flex-col'>
                  <InputField
                    label='Company Registered Name'
                    name='Company_Registered_Name'
                    onClear={() => handleClear('Company_Registered_Name')}
                  />
                </div>
                <InputField label='Phone' name='Phone' onClear={() => handleClear('Phone')} />
                <InputField label='Phone' name='Phone_2' onClear={() => handleClear('Phone_2')} />
                <InputField
                  label='First Name'
                  name='First_Name'
                  onClear={() => handleClear('First_Name')}
                  hideLabel={true}
                />
                <InputField
                  label='Last Name'
                  required
                  name='Last_Name'
                  onClear={() => handleClear('Last_Name')}
                />
                <InputField label='Mobile' name='Mobile' onClear={() => handleClear('Mobile')} />
                <InputField
                  label='Email'
                  type='email'
                  name='Email'
                  onClear={() => handleClear('Email')}
                  validationSchema={{ validate: validateEmail }}
                />
                {/* Added Website text field here, before LeadStatus */}
                <InputField label='Website' name='Website' onClear={() => handleClear('Website')} />
                <LeadStatus /> {/* Use the LeadStatus component */}
                <Stage /> {/* Use the Stage component */}
                <LeadSource /> {/* Uses the LeadSource component */}
                <Industry /> {/* Uses the Industry component */}
                {/* <Area /> Uses the Area component */}
                <InterestRate /> {/* Uses the InterestRate component */}
                {/* <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1 text-gray-400">Last Caller</label>
                  <div className="flex items-center rounded-md overflow-hidden border border-gray-600">
                    <div className="relative flex-grow">
                      <select
                        className="w-full h-[43px] py-2 px-3 appearance-none focus:outline-none focus:ring-1 bg-gray-600 text-gray-100 focus:border-orange-400 focus:ring-orange-400 border-r border-gray-600"
                        {...methods.register('Last_Caller')}
                      >
                        <option value="">None</option>
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
                </div> */}
                {/* <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1 text-gray-400">Next Follow Up Date</label>
                   <input type="date" className="w-full h-[42px] rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none" {...methods.register('nextFollowUpDate')} placeholder="MMM D, YYY" />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium mb-1 text-gray-400">Next Follow Up Time</label>
                   <input type="time" className="w-full h-[42px] rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none" {...methods.register('nextFollowUpTime')} placeholder="HH:MM AM/PM" />
                </div> */}
              </AccordionSection>

              {/* Address Information */}
              <AccordionSection
                title='Address Information'
                isOpen={sections.isAddressOpen}
                onToggle={() => toggleSection('isAddressOpen')}
              >
                <InputField label='Street' name='Street' onClear={() => handleClear('Street')} />
                <City
                  defaultValue={
                    leadData?.City_Pick_List
                      ? { label: leadData.City_Pick_List, value: leadData.City_Pick_List }
                      : null
                  }
                />
                <InputField label='State' name='State' onClear={() => handleClear('State')} />
                <InputField
                  label='Zip Code'
                  name='Zip_Code'
                  onClear={() => handleClear('Zip_Code')}
                />
                <InputField label='Country' name='Country' onClear={() => handleClear('Country')} />
                <InputField
                  label='Latitude'
                  name='Latitude'
                  onClear={() => handleClear('Latitude')}
                />
                <InputField
                  label='Longitude'
                  name='Longitude'
                  onClear={() => handleClear('Longitude')}
                />
              </AccordionSection>

              {/* Description Information */}
              <AccordionSection
                title='Description Information'
                isOpen={sections.isDescriptionOpen}
                onToggle={() => toggleSection('isDescriptionOpen')}
              >
                <div className='col-span-full flex flex-col'>
                  <label className='mb-2 block text-sm font-medium text-gray-300'>
                    Description <span className='text-red-500'>*</span>
                  </label>
                  <textarea
                    className='h-32 w-full resize-none rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                    rows={5}
                    {...methods.register('Description', { required: 'Description is required' })}
                  ></textarea>
                  {methods.formState.errors.Description && (
                    <span className='mt-1 text-xs text-red-500'>
                      {methods.formState.errors.Description.message}
                    </span>
                  )}
                </div>
              </AccordionSection>

              {/* Installation Team */}
              <AccordionSection
                title='Installation Team'
                isOpen={sections.isInstallationTeamOpen}
                onToggle={() => toggleSection('isInstallationTeamOpen')}
              >
                <InputField
                  label='Internet Connection Status'
                  name='Internet_Connection_Status'
                  onClear={() => handleClear('Internet_Connection_Status')}
                />
                <InputField
                  label='Master Socket To Counter'
                  name='Master_Socket_To_Counter'
                  onClear={() => handleClear('Internet_Connection_Status')}
                />
                <div className='flex flex-col'>
                  <label className='mb-2 block text-sm font-medium text-gray-300'>
                    Premises Condition
                  </label>
                  <div className='relative flex items-center'>
                    <input
                      type='text'
                      className='h-[42px] w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 placeholder-gray-400 transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-400 focus:outline-none'
                      {...methods.register('Premises_Condition')}
                    />
                    <img
                      src={lockPng}
                      alt='Lock'
                      className='absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2'
                    />
                  </div>
                  {methods.formState.errors.Premises_Condition && (
                    <span className='mt-1 text-xs text-red-500'>
                      {methods.formState.errors.Premises_Condition.message}
                    </span>
                  )}
                </div>
                {/* <InputField
                  label="Business Start Date"
                  type="date"
                  name="businessStartDate"
                  onClear={() => handleClear('businessStartDate')}
                /> */}
                <InputField
                  label='Land Line Provider'
                  required={false}
                  name='Land_Line_Provider'
                  onClear={() => handleClear('Land_Line_Provider')}
                />
                <SelectField
                  label='Land Line Type'
                  name='Land_Line_Type'
                  options={['Unknown', 'Analogue', 'VOIP', 'test']}
                />
                <div className='col-span-full mt-2 flex items-center'>
                  <label htmlFor='hasKitchenPrinter' className='mr-2 block text-sm text-gray-300'>
                    Has Kitchen Printer
                  </label>
                  <input
                    type='checkbox'
                    id='hasKitchenPrinter'
                    className='h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-400 focus:ring-orange-400'
                    {...methods.register('hasKitchenPrinter')}
                  />
                </div>
              </AccordionSection>
            </div>

            {/* Status Messages */}
            
              {submitStatus.error && <p className='text-sm text-red-400'>{submitStatus.error}</p>}
              {submitStatus.success && (
                <p className='text-sm text-green-400'>{submitStatus.success}</p>
              )}
            
          </div>

          {/* Submit Button - Fixed at the bottom */}
          
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-lg bg-orange-500 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isSubmitting ? 'Updating...' : 'Update Lead'}
            </button>
          
        </form>
      </div>
    </FormProvider>
  );
};

export default UpdateLead;
