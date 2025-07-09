import React, { useState } from 'react';
import Lead from './Lead'; // Import the Lead component directly
import plusIcon from '../images/plus.png';
import deleteContainerImg from '../images/deletecontainer.png';
import userIcon from '../images/user.png'; // Assuming these icons are still used in the form

const CallHistory = ({ isDarkMode = true }) => {
  const [callDescription, setCallDescription] = useState('');
  const [callResult, setCallResult] = useState('Intrested');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [shopOwnerPhone, setShopOwnerPhone] = useState('');
  const [gateKeeperName, setGateKeeperName] = useState('');
  const [gateKeeperPhone, setGateKeeperPhone] = useState('');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availability, setAvailability] = useState({
    Monday: [{ from: '00:00', to: '00:00' }],
    Tuesday: [{ from: '00:00', to: '00:00' }],
    Wednesday: [{ from: '00:00', to: '00:00' }],
    Thursday: [{ from: '00:00', to: '00:00' }],
    Friday: [{ from: '00:00', to: '00:00' }],
    Saturday: [{ from: '00:00', to: '00:00' }],
    Sunday: [{ from: '00:00', to: '00:00' }],
  });
  const [openDay, setOpenDay] = useState('Monday');
  const [activeInternalTab, setActiveInternalTab] = useState('callSummary');

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
    buttonAddAvailability: `flex-1 h-[36px] flex items-center justify-center gap-1 px-3 rounded-md transition-colors duration-200 text-white text-sm font-medium
      border border-white bg-gray-700 hover:bg-gray-800 whitespace-nowrap`,
    buttonSubmit: `w-full h-[36px] px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium`,
    // Add a section class for the availability section
    availabilitySection: `bg-gray-800 p-3 rounded-md mb-2`,
    availabilityDayHeader: `flex justify-between items-center cursor-pointer`,
    availabilityDayContent: `mt-3 space-y-2`,
    timeSlotContainer: `flex items-center gap-2`,
    timeInput: `bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-orange-400`,
    // Enhanced scrollable area with custom scrollbar
    scrollableArea: `flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar`,
  };

  const handleClear = (setter) => () => setter('');
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      callDescription,
      callResult,
      shopOwnerName,
      shopOwnerPhone,
      gateKeeperName,
      gateKeeperPhone,
      availability
    });
  };
  const handleTimeChange = (day, index, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };
  const addTimeSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], { from: '00:00', to: '00:00' }],
    }));
  };
  const removeTimeSlot = (day, index) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };
  const handleAvailabilitySubmit = () => {
    console.log('Owner Availability:', availability);
    setShowAvailabilityForm(false);
  };
  const toggleAvailabilityForm = () => {
    setShowAvailabilityForm(!showAvailabilityForm);
  };
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
      
      {/* Tab-like buttons */}
      <div className="flex mb-4 -mt-2 -mx-4 px-4 pt-2 border-b border-gray-600">
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none ${
            activeInternalTab === 'callSummary' && !showAvailabilityForm
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => { setActiveInternalTab('callSummary'); setShowAvailabilityForm(false); }}
        >
          Call Summary
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium focus:outline-none ${
            activeInternalTab === 'createLead'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => setActiveInternalTab('createLead')}
        >
          Create Lead
        </button>
      </div>

      {/* Conditional rendering based on the active tab and form state */}
      {activeInternalTab === 'createLead' ? (
        <>
          <h2 className={formClasses.heading}>Create Lead Form</h2>
          <div className={formClasses.scrollableArea}>
            <Lead isDarkMode={isDarkMode} />
          </div>
        </>
      ) : showAvailabilityForm ? (
        <>
          <h2 className={formClasses.heading}>Set Owner Availability</h2>
          <div className={formClasses.scrollableArea}>
            <div className="h-full">
              {daysOfWeek.map((day) => (
                <div key={day} className={formClasses.availabilitySection}>
                  <div
                    className={formClasses.availabilityDayHeader}
                    onClick={() => setOpenDay(openDay === day ? null : day)}
                  >
                    <span className="font-medium text-gray-200">{day}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${openDay === day ? 'rotate-180' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {openDay === day && (
                    <div className={formClasses.availabilityDayContent}>
                      {availability[day].map((slot, slotIndex) => (
                        <div key={slotIndex} className={formClasses.timeSlotContainer}>
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={slot.from}
                              onChange={(e) => handleTimeChange(day, slotIndex, 'from', e.target.value)}
                              className={formClasses.timeInput}
                            />
                            <span className="text-sm text-gray-300">To</span>
                            <input
                              type="time"
                              value={slot.to}
                              onChange={(e) => handleTimeChange(day, slotIndex, 'to', e.target.value)}
                              className={formClasses.timeInput}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day, slotIndex)}
                            className="p-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors duration-200"
                            disabled={availability[day].length === 1}
                          >
                            <img src={deleteContainerImg} alt="Delete" className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTimeSlot(day)}
                        className="flex items-center justify-center w-6 h-6 rounded-sm bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                      >
                        <img src={plusIcon} alt="Add" className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 pt-4 border-t border-gray-600">
              <button
                onClick={handleAvailabilitySubmit}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Submit
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <button
                onClick={toggleAvailabilityForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Back to Call Summary
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className={formClasses.heading}>Call Summary Form</h2>
          <div className={formClasses.scrollableArea}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="mb-3">
                <label htmlFor="callDescription" className={formClasses.label}>
                  Call Description<span className={formClasses.requiredStar}>*</span>
                </label>
                <textarea
                  id="callDescription"
                  rows="3"
                  className={formClasses.textArea}
                  placeholder="Enter call description..."
                  value={callDescription}
                  onChange={(e) => setCallDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="callResult" className={formClasses.label}>
                  Select Call Result<span className={formClasses.requiredStar}>*</span>
                </label>
                <div className="relative">
                  <select
                    id="callResult"
                    className={formClasses.select}
                    value={callResult}
                    onChange={(e) => setCallResult(e.target.value)}
                    required
                  >
                    <option value="Intrested">Intrested</option>
                    <option value="appointmentSet">Appointment is set</option>
                    <option value="notInterested">Not interested</option>
                    <option value="followUp">Follow up</option>
                    <option value="hangUp">Hang up</option>
                    <option value="fourthAction">Fourth action</option>
                  </select>
                  <div className={formClasses.selectArrow}>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="shopOwnerName" className={formClasses.label}>Shop Owner's Name</label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type="text"
                      id="shopOwnerName"
                      className={formClasses.inputBase}
                      placeholder="Enter owner's name"
                      value={shopOwnerName}
                      onChange={(e) => setShopOwnerName(e.target.value)}
                    />
                    {shopOwnerName && (
                      <button
                        type="button"
                        onClick={handleClear(setShopOwnerName)}
                        className={formClasses.clearButton}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="shopOwnerPhone" className={formClasses.label}>Shop Owner's Phone</label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type="tel"
                      id="shopOwnerPhone"
                      className={formClasses.inputBase}
                      placeholder="Enter owner's phone"
                      value={shopOwnerPhone}
                      onChange={(e) => setShopOwnerPhone(e.target.value)}
                    />
                    {shopOwnerPhone && (
                      <button
                        type="button"
                        onClick={handleClear(setShopOwnerPhone)}
                        className={formClasses.clearButton}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="gateKeeperName" className={formClasses.label}>Gate Keeper's Name</label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type="text"
                      id="gateKeeperName"
                      className={formClasses.inputBase}
                      placeholder="Enter gatekeeper's name"
                      value={gateKeeperName}
                      onChange={(e) => setGateKeeperName(e.target.value)}
                    />
                    {gateKeeperName && (
                      <button
                        type="button"
                        onClick={handleClear(setGateKeeperName)}
                        className={formClasses.clearButton}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="gateKeeperPhone" className={formClasses.label}>Gate Keeper's Phone</label>
                  <div className={formClasses.inputGroup}>
                    <input
                      type="tel"
                      id="gateKeeperPhone"
                      className={formClasses.inputBase}
                      placeholder="Enter gatekeeper's phone"
                      value={gateKeeperPhone}
                      onChange={(e) => setGateKeeperPhone(e.target.value)}
                    />
                    {gateKeeperPhone && (
                      <button
                        type="button"
                        onClick={handleClear(setGateKeeperPhone)}
                        className={formClasses.clearButton}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={toggleAvailabilityForm}
                  className={formClasses.buttonAddAvailability}
                >
                  <img src={plusIcon} alt="Add" className="h-4 w-4 mr-1" />
                  Add Owner Availability
                </button>
              </div>
              <div className="mt-auto">
                <button
                  type="submit"
                  className={formClasses.buttonSubmit}
                >
                  Submit Call Summary
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