import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const APIURL = "https://localhost:7256/api/School/teacher";
const DROPDOWNURL = "https://localhost:7256/api/School/StudentDropDowns";

const initialTeacherForm = {
  action: "create",
  teacherId: 0,
  employeeNo: "",
  firstName: "",
  lastName: "",
  email: "",
  payScale: "",
  panNumber: "",
  adharNumber: "",
  phoneNumber: "",
  designationId: 0,
  departmentId: 0,
  employmentType: 0,
  fatherName: "",
  country: 0,
  state: 0,
  adress: "",
  pincode: 0,
  hireDate: "",
  isActive: true,
};

function formatDateForPicker(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}
function formatDateToISO(date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function TeacherForm() {
  const [form, setForm] = useState(initialTeacherForm);
  const [dropdownData, setDropdownData] = useState({
    Department: [],
    Designation: [],
    country: [],
    state: [],
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState({ open: false, type: "", text: "" });
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchDropdowns() {
    try {
      const response = await fetch(DROPDOWNURL);
      const data = await response.json();
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.LookupName]) acc[item.LookupName] = [];
        acc[item.LookupName].push(item);
        return acc;
      }, {});
      setDropdownData({
        Department: grouped["Department"] || [],
        Designation: grouped["Designation"] || [],
        country: grouped["country"] || [],
        state: grouped["state"] || [],
      });
    } catch {
      setDropdownData({
        Department: [],
        Designation: [],
        country: [],
        state: [],
      });
    }
  }
  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === "checkbox") val = checked;
    else if (type === "select-one" || type === "number") val = Number(value) || 0;
    setForm((prev) => ({
      ...prev,
      [name]: val ?? "",
    }));
  }
  function handleNotify(type, text) {
    setNotify({ open: true, type, text });
    setTimeout(() => setNotify({ open: false, type: "", text: "" }), 2500);
  }
  function handleBack() {
    if (JSON.stringify(form) !== JSON.stringify(initialTeacherForm)) setShowConfirmExit(true);
    else navigate("/admin/Teacherlist");
  }
  function confirmExit() { setShowConfirmExit(false); navigate("/"); }
  function cancelExit() { setShowConfirmExit(false); }
  async function handleSaveTeacher(e) {
    e.preventDefault();
    setModalLoading(true);
    setMessage("");
    if (!form.employeeNo || !form.firstName || !form.phoneNumber || !form.email) {
      setMessage("Fill all required fields!");
      setModalLoading(false);
      return;
    }
    const reqBody = {
      ...form,
      designationId: Number(form.designationId),
      departmentId: Number(form.departmentId),
      employmentType: Number(form.employmentType),
      country: Number(form.country),
      state: Number(form.state),
      hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : null,
    };
    try {
      const response = await fetch(APIURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const res = await response.json();
      if (res[0]?.SuccesCode === 1) {
        handleNotify("success", "Record successfully saved");
        setMessage(res[0].ValidationMessage || "Success!");
        setTimeout(() => navigate("/admin/Teacherlist"), 800);
      } else {
        const errMsg = typeof res[0]?.ValidationMessage === "string" ? res[0]?.ValidationMessage : "Database validation error";
        handleNotify("error", errMsg);
        setMessage(errMsg);
      }
    } catch (e) {
      handleNotify("error", e?.message || "Server error!");
      setMessage(e?.message || "Server error!");
    }
    setModalLoading(false);
  }

  return (
    <div className="min-h-screen w-full px-6 py-12 bg-gradient-to-tr from-purple-600 via-purple-700 to-blue-800 flex flex-col items-center font-sans text-white transition-colors duration-500">
      <style>{`
        ::-webkit-scrollbar { width: 8px; background: #1e1b4b; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#a78bfa 0%,#6366f1 100%); border-radius: 7px;}
      `}</style>
      {notify.open && (
        <div className={`fixed top-7 right-8 z-[60] px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all ${
          notify.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notify.text}
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-[#3b0764] via-[#292277] to-[#2563eb] rounded-3xl border-2 border-purple-700 shadow-2xl p-10 relative">
        {/* BACK BUTTON */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-8 flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        {showConfirmExit && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 rounded-3xl p-8 z-[85] text-center">
            <p className="mb-6 text-xl font-semibold text-pink-400">Are you sure you want to leave? Unsaved changes will be lost!</p>
            <div className="flex gap-8">
              <button onClick={confirmExit} className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-lg text-lg shadow-lg transition">Yes, Leave</button>
              <button onClick={cancelExit} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-lg text-lg shadow-lg transition">Cancel</button>
            </div>
          </div>
        )}
        <h2 className="text-3xl font-extrabold text-purple-300 mb-8 select-none text-center">
          Add Teacher
        </h2>
        <form onSubmit={handleSaveTeacher} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 pt-7 pb-1">
          {/* Input fields */}
          {[
            { name: "employeeNo", label: "Employee No *", required: true },
            { name: "firstName", label: "First Name *", required: true },
            { name: "lastName", label: "Last Name" },
            { name: "email", label: "Email *", required: true, type: "email" },
            { name: "phoneNumber", label: "Phone Number *", required: true },
            { name: "payScale", label: "Pay Scale" },
            { name: "panNumber", label: "PAN Number" },
            { name: "adharNumber", label: "Adhar Number" },
            { name: "fatherName", label: "Father Name" },
            { name: "adress", label: "Address" },
            { name: "pincode", label: "Pincode", type: "number" }
          ].map(({ name, label, required, type }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="mb-2 text-xs font-bold text-purple-200 uppercase tracking-wide select-none">{label}</label>
              <input id={name} name={name} required={required} type={type || "text"} value={form[name]} onChange={handleFormChange} autoComplete="off"
                className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          ))}
          {/* Hire Date DatePicker */}
          <div className="flex flex-col">
            <label htmlFor="hireDate" className="mb-2 text-xs font-bold text-purple-200 uppercase tracking-wide select-none">Hire Date</label>
            <DatePicker
              id="hireDate"
              selected={formatDateForPicker(form.hireDate)}
              onChange={date => setForm(prev => ({ ...prev, hireDate: formatDateToISO(date) }))}
              className="px-4 py-3 rounded-lg bg-white/10 border-2 border-purple-600 hover:border-blue-400 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholderText="Select date"
              dateFormat="yyyy-MM-dd"
              showPopperArrow={false}
            />
          </div>
          {/* Dropdowns */}
          {[
            { name: "departmentId", label: "Department", options: dropdownData.Department },
            { name: "designationId", label: "Designation", options: dropdownData.Designation },
            { name: "country", label: "Country", options: dropdownData.country },
            { name: "state", label: "State", options: dropdownData.state }
          ].map(({ name, label, options }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="mb-2 text-xs font-bold text-purple-200 uppercase tracking-wide select-none">{label}</label>
              <select id={name} name={name} value={form[name]} onChange={handleFormChange}
                className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none">
                <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select {label}</option>
                {options.map(opt => (
                  <option key={opt.LookupId} value={opt.LookupId} className="bg-purple-900 text-white font-semibold">{opt.Meaning}</option>
                ))}
              </select>
            </div>
          ))}
        </form>
        {message && (
          <div className="text-center text-pink-200 bg-purple-900 bg-opacity-60 rounded-xl py-3 px-4 font-bold animate-pulse shadow-lg border-2 border-pink-500 text-sm mt-6 select-none">{message}</div>
        )}
        <div className="flex justify-center items-center mt-10">
          <button
            onClick={handleSaveTeacher}
            disabled={modalLoading}
            className="px-10 py-3 text-base font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl transition disabled:opacity-50 text-white uppercase tracking-wide"
            type="submit"
          >
            Add Teacher
          </button>
        </div>
      </div>
    </div>
  );
}
