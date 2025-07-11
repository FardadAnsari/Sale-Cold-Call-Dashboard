// src/mockCallHistory.js
const mockCallHistory = {
  "Mario's Pizza Palace": [
    {
      id: 1,
      caller: "Ali",
      timestamp: "2 Jun 2025, 17:30",
      duration: "05:36",
      connectionMethod: "Zoho Call",
      result: "He Could Sell a Kiosk",
      transcript: {
        caller: "Hi, do you have space for a kiosk in front?",
        owner: "We already have one, but maybe near the entrance."
      }
    },
    {
      id: 2,
      caller: "Sarah",
      timestamp: "1 Jun 2025, 14:20",
      duration: "03:15",
      connectionMethod: "Direct Line",
      result: "Left Voicemail",
      transcript: {
        caller: "Can we install our delivery pickup stand outside?",
        owner: "Leave a message, we’ll get back to you."
      }
    }
  ],
  "The Royal Café": [
    {
      id: 3,
      caller: "John",
      timestamp: "3 Jun 2025, 11:10",
      duration: "02:45",
      connectionMethod: "Zoho Call",
      result: "Booked Table",
      transcript: {
        caller: "Reserving table for 4 tonight.",
        owner: "Yes, at 7 PM. Confirmation #456 sent."
      }
    }
  ]
};

export default mockCallHistory;