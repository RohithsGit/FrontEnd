import { useState, useEffect } from "react";
export default function Notifications() {
    // Replace with real API call
    const notifications = [
      { id: 1, message: "Room inspection at 5pm today", date: "2025-10-26" },
      { id: 2, message: "Fee payment last date approaching", date: "2025-10-28" }
    ];
  
    return (
      <div className="max-w-lg mx-auto bg-white/90 p-8 rounded-xl shadow-md animate-[fadeIn_1s_ease]">
        <h2 className="text-2xl font-bold text-indigo-700 mb-5">Notifications</h2>
        {notifications.map(notif => (
          <div key={notif.id} className="bg-indigo-50 rounded px-4 py-3 mb-3 border-l-4 border-indigo-400 animate-[slideIn_600ms_ease]">
            <p className="text-black font-medium">{notif.message}</p>
            <p className="text-xs text-gray-500">{notif.date}</p>
          </div>
        ))}
        <style>{`
          @keyframes slideIn { from { opacity:.2; transform: translateX(-20px)} to {opacity:1;transform:translateX(0)} }
        `}</style>
      </div>
    );
  }
  