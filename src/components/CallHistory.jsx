import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import Lead from './Lead';
import plusIcon from '../images/Plus.png';
import deleteContainerImg from '../images/DeleteContainer.png';
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE_URL } from 'src/api';

const CallHistory = ({ isDarkMode = true , shopId}) => {

  const {
    register: registerCase,
    handleSubmit: handleSubmitCase,
    formState: { errors: caseErrors },
    reset: resetCase,
  } = useForm();

  const {
    register: registerSummary,
    handleSubmit: handleSubmitSummary,
    formState: { errors: summaryErrors },
    reset: resetSummary,
  } = useForm();
const [sessionId, setSessionId]= useState(0)

  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [openDay, setOpenDay] = useState('Monday');
  const [activeInternalTab, setActiveInternalTab] = useState('callSummary');
  const [caseCreated, setCaseCreated] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
useEffect(() => {
  console.log('Received shopId in CallHistory:', shopId);
}, [shopId]);
  const formClasses = {
    container: `flex-1 bg-gray-700 rounded-lg shadow-md p-4 flex flex-col h-full relative`,
    heading: `text-lg font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`,
    label: `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`,
    requiredStar: `text-red-500 ml-1`,
    inputGroup: `relative flex items-center`,
    inputBase: `w-full h-[36px] py-2 px-3 text-sm font-medium border border-gray-600 rounded-md focus:outline-none focus:ring-1
      ${isDarkMode
        ? 'bg-gray-600 text-gray-100 placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400'
        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
      } placeholder:text-xs`,
    clearButton: `absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer text-lg font-bold`,
    textArea: `w-full p-2 border rounded-md focus:outline-none focus:ring-1 resize-none text-sm ${
      isDarkMode
        ? 'bg-gray-600 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400'
        : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
    } placeholder:text-xs`,
    select: `w-full h-[36px] py-2 px-3 text-sm appearance-none border border-gray-600 rounded-md focus:outline-none focus:ring-1
      ${isDarkMode
        ? 'bg-gray-600 text-gray-100 focus:border-orange-400 focus:ring-orange-400'
        : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
      }`,
    selectArrow: `pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 ${isDarkMode ? 'text-orange-400' : 'text-gray-400'}`,
    buttonAddAvailability: `flex-1 h-[28px] flex items-center justify-center gap-1 px-2 rounded-md transition-colors duration-200 text-white text-sm font-medium
      border border-white bg-gray-700 hover:bg-gray-800 whitespace-nowrap`,
    buttonCreateCase: `w-full h-[36px] mt-2 mb-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors duration-200 font-medium`,
    buttonSubmit: `w-full h-[36px] px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500`,
    availabilitySection: `bg-gray-800 p-3 rounded-md mb-2`,
    availabilityDayHeader: `flex justify-between items-center cursor-pointer`,
    availabilityDayContent: `mt-3 space-y-2`,
    timeSlotContainer: `flex items-center gap-2`,
    timeInput: `bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-400`,
    scrollableArea: `flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar`,
  };

  const handleTimeChange = (day, index, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    }));
  };

  const addTimeSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }],
    }));
  };

  const removeTimeSlot = (day, index) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleAvailabilitySubmit = () => {
    console.log('Owner Availability Submitted:', JSON.stringify(availability, null, 2));
    setShowAvailabilityForm(false);
    Swal.fire({
      icon: 'success',
      title: 'Availability Saved!',
      text: 'Owner availability has been successfully updated.',
      background: isDarkMode ? '#4A5568' : '#fff',
      color: isDarkMode ? '#E2E8F0' : '#1A202C',
      confirmButtonColor: '#3B82F6',
    });
  };

  const toggleAvailabilityForm = () => {
    setShowAvailabilityForm(!showAvailabilityForm);
  };

  const onSubmitCreateCase = async (formData) => {
    try {
      const authToken = sessionStorage.getItem('authToken');

      const userRes = await axios.get(`${API_BASE_URL}/user/info/`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      const user = userRes.data;
      setUserDetails(user);
      const leadPayload = {
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        close_time: new Date().toISOString(),
        created_by: user?.id || 0,
        customer: {
          shop_id_company: shopId,
          customer_name: formData.shopOwnerName,
          customer_phone: formData.shopOwnerPhone,
          customer_assistant_phone: formData.gateKeeperPhone,
          customer_assistant_name: formData.gateKeeperName,
          customer_availability: availability
        },
      };

      const res = await axios.post(
        `${API_BASE_URL}/history/create-sale-session/`,
        leadPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log(res);
      resetCase()
      
      setSessionId(res?.data?.customer?.id);
      setCaseCreated(true);

      Swal.fire({
        icon: 'info',
        title: 'Case Created!',
        text: 'You can now fill in call details.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
    } catch (error) {
      console.error('Create Case Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while creating the sale session.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
    }
  };

  const submitCallSummary = async (data) => {
    const token = sessionStorage.getItem('authToken');

    const payload = {
      date: new Date().toISOString(),
      user_id: userDetails?.id || 0,
      call_time: new Date().toISOString(), // or custom time input if you want
      sale_session_id: sessionId ?? 0, // adjust if needed
      call_description: data.callDescription,
      stage: data.callResult,
    };

    const res = await axios.post(
      `${API_BASE_URL}/history/create-history/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(res);

    return res.data;
  };

  const mutation = useMutation({
    mutationFn: submitCallSummary,
    onSuccess: (data) => {
      Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: 'Call summary has been recorded.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
      resetSummary();
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'There was an error submitting the call summary.',
        background: isDarkMode ? '#4A5568' : '#fff',
        color: isDarkMode ? '#E2E8F0' : '#1A202C',
        confirmButtonColor: '#A78BFA',
      });
    },
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  return (
    <div className={formClasses.container}>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
        .custom-scrollbar {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className='-mx-4 -mt-2 mb-4 flex border-b border-gray-600 px-4 pt-2'>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeInternalTab === 'callSummary'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => {
            setActiveInternalTab('callSummary');
          }}
        >
          Call Summary
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeInternalTab === 'createLead'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => {
            setActiveInternalTab('createLead');
            setShowAvailabilityForm(false);
          }}
        >
          Create Lead
        </button>
      </div>

      {activeInternalTab === 'createLead' ? (
        <>
          <div className={formClasses.scrollableArea}>
            <Lead isDarkMode={isDarkMode} />
          </div>
        </>
      ) : showAvailabilityForm ? (
        <>
          <h2 className={formClasses.heading}>Set Owner Availability</h2>
          <div className={formClasses.scrollableArea}>
            <div className='flex h-full flex-col'>
              <div className='custom-scrollbar flex-1 overflow-y-auto pr-2'>
                {daysOfWeek.map((day) => (
                  <div key={day} className={formClasses.availabilitySection}>
                    <div
                      className={formClasses.availabilityDayHeader}
                      onClick={() => setOpenDay(openDay === day ? null : day)}
                    >
                      <span className='font-medium text-gray-200'>{day}</span>
                      <svg
                        className={`h-5 w-5 transition-transform duration-200 ${openDay === day ? 'rotate-180' : ''}`}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    {openDay === day && (
                      <div className={formClasses.availabilityDayContent}>
                        {availability[day].map((slot, slotIndex) => (
                          <div key={slotIndex} className={formClasses.timeSlotContainer}>
                            <div className='flex flex-1 items-center gap-2'>
                              <input
                                type='time'
                                value={slot.start}
                                onChange={(e) =>
                                  handleTimeChange(day, slotIndex, 'start', e.target.value)
                                }
                                className={formClasses.timeInput}
                              />
                              <span className='text-sm text-gray-300'>To</span>
                              <input
                                type='time'
                                value={slot.end}
                                onChange={(e) =>
                                  handleTimeChange(day, slotIndex, 'end', e.target.value)
                                }
                                className={formClasses.timeInput}
                              />
                            </div>
                            <button
                              type='button'
                              onClick={() => removeTimeSlot(day, slotIndex)}
                              className='rounded-md bg-gray-600 p-2 transition-colors duration-200 hover:bg-gray-500'
                            >
                              <img src={deleteContainerImg} alt='Delete' className='h-4 w-4' />
                            </button>
                          </div>
                        ))}
                        <button
                          type='button'
                          onClick={() => addTimeSlot(day)}
                          className='flex h-6 w-6 items-center justify-center rounded-sm bg-blue-500 transition-colors duration-200 hover:bg-blue-600'
                        >
                          <img src={plusIcon} alt='Add' className='h-3 w-3' />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className='mt-auto flex justify-center border-t border-gray-600 pt-4'>
                <button
                  onClick={handleAvailabilitySubmit}
                  className='rounded-md bg-blue-500 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-600'
                >
                  Save Availability
                </button>
              </div>
              <div className='mt-6 flex justify-center'>
                <button
                  onClick={toggleAvailabilityForm}
                  className='rounded-md bg-gray-500 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-gray-600'
                >
                  Back to Call Summary
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`flex h-full flex-col justify-between ${formClasses.scrollableArea}`}>
            <form onSubmit={handleSubmitCase(onSubmitCreateCase)}>
              <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div>
                  <label htmlFor='shopOwnerName' className={formClasses.label}>
                    Shop Owner's Name
                  </label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type='text'
                      id='shopOwnerName'
                      className={formClasses.inputBase}
                      placeholder="Enter owner's name"
                      {...registerCase('shopOwnerName')}
                    />
                    {/* No clear button needed since RHF handles value */}
                    {caseErrors.shopOwnerName && (
                      <span className='text-xs text-red-500'>Required</span>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor='shopOwnerPhone' className={formClasses.label}>
                    Shop Owner's Phone
                  </label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type='tel'
                      id='shopOwnerPhone'
                      className={formClasses.inputBase}
                      placeholder="Enter owner's phone"
                      {...registerCase('shopOwnerPhone')}
                    />
                    {caseErrors.shopOwnerPhone && (
                      <span className='text-xs text-red-500'>Required</span>
                    )}
                  </div>
                </div>
              </div>

              <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div>
                  <label htmlFor='gateKeeperName' className={formClasses.label}>
                    Gate Keeper's Name
                  </label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type='text'
                      id='gateKeeperName'
                      className={formClasses.inputBase}
                      placeholder="Enter gatekeeper's name"
                      {...registerCase('gateKeeperName')}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor='gateKeeperPhone' className={formClasses.label}>
                    Gate Keeper's Phone
                  </label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type='tel'
                      id='gateKeeperPhone'
                      className={formClasses.inputBase}
                      placeholder="Enter gatekeeper's phone"
                      {...registerCase('gateKeeperPhone')}
                    />
                  </div>
                </div>
              </div>

              <div className='mb-2'>
                <div className='flex flex-col sm:flex-row sm:items-center'>
                  <button
                    type='button'
                    onClick={toggleAvailabilityForm}
                    className={formClasses.buttonAddAvailability}
                  >
                    <img src={plusIcon} alt='Add' className='mr-1 h-4 w-4' />
                    Add Owner Availability
                  </button>
                </div>

                {/* ⬇️ Availability shown below the button, not beside it */}
                {availability && (
                  <div className='mt-3 w-full rounded-md bg-gray-800 p-3 text-sm text-gray-200'>
                    <div className='mb-2 font-medium text-gray-300'>Current Availability:</div>
                    <ul className='list-inside list-disc space-y-1'>
                      {daysOfWeek.map((day) => {
                        const validSlots = availability[day]?.filter(
                          (slot) => slot.start !== '00:00' || slot.end !== '00:00'
                        );

                        if (validSlots && validSlots.length > 0) {
                          const times = validSlots
                            .map((slot) => `${slot.start}-${slot.end}`)
                            .join(', ');
                          return (
                            <li key={day}>
                              <span className='font-semibold'>{day}</span>: {times}
                            </li>
                          );
                        }

                        return null;
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <div className='mt-2 mb-2 flex justify-center'>
                <button
                  type='submit'
                  className={formClasses.buttonCreateCase}
                  disabled={caseCreated}
                >
                  {caseCreated ? 'Case Created' : 'Create Case'}
                </button>
              </div>
            </form>
            <form onSubmit={handleSubmitSummary(mutation.mutate)}>
              <div className='mb-3'>
                <label htmlFor='callResult' className={formClasses.label}>
                  Select Call Result<span className={formClasses.requiredStar}>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='callResult'
                    className={formClasses.select}
                    disabled={!caseCreated}
                    {...registerSummary('callResult', { required: true })}
                  >
                    <option value=''>-- Select --</option>
                    <option value='Intrested'>Interested</option>
                    <option value='appointmentSet'>Appointment is set</option>
                    <option value='notInterested'>Not interested</option>
                    <option value='followUp'>Follow up</option>
                    <option value='hangUp'>Hang up</option>
                    <option value='fourthAction'>Fourth action</option>
                  </select>
                  <div className={formClasses.selectArrow}>
                    <svg className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                      <path
                        fillRule='evenodd'
                        d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                {summaryErrors.callResult && <span className='text-xs text-red-500'>Required</span>}
              </div>
              <div className='mb-3'>
                <label htmlFor='callDescription' className={formClasses.label}>
                  Call Description<span className={formClasses.requiredStar}>*</span>
                </label>
                <textarea
                  id='callDescription'
                  rows='4'
                  className={formClasses.textArea}
                  placeholder='Enter call description...'
                  disabled={!caseCreated}
                  {...registerSummary('callDescription', { required: true })}
                ></textarea>
                {summaryErrors.callDescription && (
                  <span className='text-xs text-red-500'>Required</span>
                )}
              </div>

              <div className='mt-auto'>
                <button
                  type='submit'
                  className={formClasses.buttonSubmit}
                  disabled={!caseCreated || mutation.isLoading}
                >
                  {mutation.isLoading ? 'Submitting...' : 'Submit Call Summary'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CallHistory;
