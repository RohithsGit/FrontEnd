import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const APIURL = "https://localhost:7256/api/School/teacher";

export default function Teacher() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchEmployeeNo, setSearchEmployeeNo] = useState("");
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    setLoading(true);
    try {
      const response = await fetch(APIURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      setTeachers(data);
    } catch {
      setTeachers([]);
    }
    setLoading(false);
  }

  const filteredTeachers = teachers.filter((t) => {
    const fullName = `${t.FirstName ?? ""} ${t.LastName ?? ""}`.toLowerCase();
    return (
      fullName.includes(searchName.toLowerCase()) &&
      (t.EmployeeNo ?? "").toLowerCase().includes(searchEmployeeNo.toLowerCase()) &&
      (t.PhoneNumber ?? "").toLowerCase().includes(searchPhoneNumber.toLowerCase()) &&
      (t.Email ?? "").toLowerCase().includes(searchEmail.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen w-full px-6 py-12 bg-gradient-to-tr from-purple-600 via-purple-700 to-blue-800 flex flex-col items-center font-sans text-white">
      <style>{`
        ::-webkit-scrollbar { width: 8px; background: #1e1b4b; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#a78bfa 0%,#6366f1 100%); border-radius: 7px;}
      `}</style>
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-400 to-purple-500 drop-shadow-lg">Teachers</h1>
          <button
            onClick={() => navigate("/admin/add-teacher")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition transform hover:scale-105"
          >
            + Add
          </button>
        </div>
        {/* Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <input type="text" placeholder="Name" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm" />
          <input type="text" placeholder="Employee No" value={searchEmployeeNo} onChange={(e) => setSearchEmployeeNo(e.target.value)} className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm" />
          <input type="text" placeholder="Phone Number" value={searchPhoneNumber} onChange={(e) => setSearchPhoneNumber(e.target.value)} className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm" />
          <input type="email" placeholder="Email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm" />
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-3xl shadow-2xl bg-white bg-opacity-20 border border-purple-400">
          <table className="w-full min-w-[900px] text-sm border-collapse border border-purple-500">
            <thead className="bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Name</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Employee No</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Phone</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Email</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-center text-sm">Active</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-purple-300 text-sm">Loading...</td>
                </tr>
              )}
              {!loading && filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-purple-400 text-sm">No teachers found.</td>
                </tr>
              )}
              {!loading && filteredTeachers.map((t) => (
                  <tr key={t.TeacherId} className="hover:bg-gradient-to-r hover:from-purple-700 hover:to-blue-700 transition-colors cursor-pointer">
                      <td className="border border-purple-700 p-2 font-semibold text-sm">
                        {t.FirstName ?? ""} {t.LastName ?? ""}
                      </td>
                      <td className="border border-purple-700 p-2 text-sm">{t.EmployeeNo ?? "-"}</td>
                      <td className="border border-purple-700 p-2 font-mono text-purple-300 text-sm">{t.PhoneNumber ?? "-"}</td>
                      <td className="border border-purple-700 p-2 text-sm">{t.Email ?? "-"}</td>
                      <td className="border border-purple-700 p-2 text-center text-sm">{t.IsActive ? <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span> : <span className="inline-block w-3 h-3 rounded-full bg-gray-600"></span>}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
