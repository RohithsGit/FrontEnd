import { useState, useEffect } from "react";
export default function Profile() {
    // Replace with useEffect and API fetch for actual user data
    const user = {
      name: "Admin Rohith",
      email: "admin@hostel.com",
      phone: "9898989898",
      role: "Admin"
    };
  
    return (
      <div className="max-w-xl mx-auto bg-white/90 p-8 rounded-xl shadow-md animate-[fadeIn_1s_ease]">
        <h2 className="text-2xl font-bold text-indigo-700 mb-3">Profile</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
          <p><span className="font-semibold">Phone:</span> {user.phone}</p>
          <p><span className="font-semibold">Role:</span> {user.role}</p>
        </div>
        <div className="mt-4 flex">
          <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium">
            Edit Details
          </button>
        </div>
      </div>
    );
  }
  