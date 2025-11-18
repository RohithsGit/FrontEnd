import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = "https://localhost:7256/api/School/student";
const DROPDOWN_URL = "https://localhost:7256/api/School/StudentDropDowns";

const initialStudentForm = {
  action: "create",
  studentId: 0,
  admissionNo: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  genderId: 0,
  admissionDate: "",
  isActive: true,
  adharNumber: "",
  phnNumber: "",
  email: "",
  admissionType: 0,
  religion: 0,
  country: 0,
  state: 0,
  adress: "",
  pincode: "",
  fatherName: "",
  parentMobileNo: "",
  parentEmail: "",
  caste: 0,
  subCaste: 0,
  acyear: 0,
};

export default function Student() {
  const [students, setStudents] = useState([]);
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownsReady, setDropdownsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchAdmissionNo, setSearchAdmissionNo] = useState("");
  const [searchPhnNumber, setSearchPhnNumber] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(initialStudentForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [notify, setNotify] = useState({ open: false, type: "", text: "" });

  useEffect(() => {
    fetchStudents();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (showModal) {
      setModalVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setModalVisible(false), 300);
      document.body.style.overflow = "auto";
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      setStudents(data);
    } catch {
      setMessage("Error fetching students.");
      setStudents([]);
    }
    setLoading(false);
  }

  async function fetchDropdowns() {
    try {
      const response = await fetch(DROPDOWN_URL);
      const data = await response.json();
      setDropdowns(data);
      setDropdownsReady(true);
    } catch {
      setDropdowns([]);
      setDropdownsReady(true);
    }
  }

  function getDropdownOptions(name) {
    if (!dropdownsReady) return [];
    return dropdowns.filter((d) => d.LookupName.toLowerCase() === name.toLowerCase());
  }

  function openModal(student) {
    if (student) {
      setForm({
        ...initialStudentForm,
        action: "update",
        studentId: student.studentId || 0,
        admissionNo: student.AdmissionNo ?? "",
        firstName: student.FirstName ?? "",
        lastName: student.LastName ?? "",
        dateOfBirth: student.DateOfBirth ? student.DateOfBirth.split("T")[0] : "",
        genderId: student.GenderId ?? 0,
        admissionDate: student.AdmissionDate ? student.AdmissionDate.split("T")[0] : "",
        isActive: !!student.IsActive,
        adharNumber: student.AdharNumber ?? "",
        phnNumber: student.PhnNumber ?? "",
        email: student.Email ?? "",
        admissionType: student.AdmissionType ?? 0,
        religion: student.Religion ?? 0,
        country: student.Country ?? 0,
        state: student.State ?? 0,
        adress: student.Adress ?? "",
        pincode: student.Pincode ?? "",
        fatherName: student.FatherName ?? "",
        parentMobileNo: student.ParentMobileNo ?? "",
        parentEmail: student.ParentEmail ?? "",
        caste: student.Caste ?? 0,
        subCaste: student.SubCaste ?? 0,
        acyear: student.Acyear ?? 0,
      });
      setEditingId(student.studentId || 0);
    } else {
      setForm(initialStudentForm);
      setEditingId(null);
    }
    setMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(initialStudentForm);
    setMessage("");
    setModalLoading(false);
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

  const toISOString = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  async function handleSaveStudent(e) {
    e.preventDefault();
    setModalLoading(true);
    setMessage("");
    if (!form.admissionNo || !form.firstName || !form.phnNumber || !form.email) {
      setMessage("Fill all required fields!");
      setModalLoading(false);
      return;
    }
    const reqBody = {
      ...form,
      dateOfBirth: toISOString(form.dateOfBirth),
      admissionDate: toISOString(form.admissionDate),
      genderId: Number(form.genderId),
      admissionType: Number(form.admissionType),
      religion: Number(form.religion),
      country: Number(form.country),
      state: Number(form.state),
      caste: Number(form.caste),
      subCaste: Number(form.subCaste),
      acyear: Number(form.acyear),
    };
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const res = await response.json();
      if (res[0]?.SuccesCode === 1) {
        handleNotify("success", "Record successfully saved");
        setMessage(res[0].ValidationMessage || "Success!");
        fetchStudents();
        setTimeout(closeModal, 1000);
      } else {
        const errMsg =
          typeof res[0]?.ValidationMessage === "string"
            ? res[0]?.ValidationMessage
            : "Database validation error";
        handleNotify("error", errMsg);
        setMessage(errMsg);
      }
    } catch (e) {
      handleNotify("error", e?.message || "Server error!");
      setMessage(e?.message || "Server error!");
    }
    setModalLoading(false);
  }

  async function handleDeleteStudent() {
    setModalLoading(true);
    setMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", studentId: deleteId }),
      });
      const res = await response.json();
      if (res[0]?.SuccesCode === 1) {
        handleNotify("success", "Record successfully deleted");
        setMessage("Deleted!");
        fetchStudents();
        setTimeout(() => setDeleteId(null), 600);
      } else {
        const errMsg =
          typeof res[0]?.ValidationMessage === "string"
            ? res[0]?.ValidationMessage
            : "Delete failed";
        handleNotify("error", errMsg);
        setMessage(errMsg);
      }
    } catch (e) {
      handleNotify("error", e?.message || "Server error!");
      setMessage(e?.message || "Server error!");
    }
    setModalLoading(false);
  }

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.FirstName ?? ""} ${s.LastName ?? ""}`.toLowerCase();
    return (
      fullName.includes(searchName.toLowerCase()) &&
      (s.AdmissionNo ?? "").toLowerCase().includes(searchAdmissionNo.toLowerCase()) &&
      (s.PhnNumber ?? "").toLowerCase().includes(searchPhnNumber.toLowerCase()) &&
      (s.Email ?? "").toLowerCase().includes(searchEmail.toLowerCase())
    );
  });
  
    function toDate(str) {
    if (!str) return null;
    // Accepts "yyyy-mm-dd" or full ISO format, returns JS Date
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  return (
    
    <div
      className={`min-h-screen w-full px-6 py-12 bg-gradient-to-tr from-purple-600 via-purple-700 to-blue-800 flex flex-col items-center font-sans text-white transition-colors duration-500 ${showModal ? "overflow-hidden" : "overflow-auto"}`}
      style={{ scrollbarWidth: "thin" }}
    >
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px;}
        ::-webkit-scrollbar-track { background: rgba(255 255 255 / 0.1); border-radius: 10px;}
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #8b5cf6, #3b82f6); border-radius: 10px;}
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #7c3aed, #2563eb);}
        scrollbar-color: #8b5cf6 transparent;
        scrollbar-width: thin;
        select option { background-color: #1e1b4b; color: #e0e7ff; padding: 10px; font-weight: 600; }
        select option:checked { background: linear-gradient(#3b82f6, #6366f1); background-color: #3b82f6; color: white; font-weight: 700; }
        input[type="date"] {
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(30, 58, 138, 0.85) 100%);
          padding: 12px !important;
          font-size: 13px !important;
          font-weight: 700;
          letter-spacing: 0.5px;
          width: 100% !important;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.95) brightness(1.15);
          cursor: pointer;
          border-radius: 6px;
          padding: 5px 10px;
          transition: all 0.3s ease;
          background: rgba(59, 130, 246, 0.2);
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          background: rgba(59, 130, 246, 0.4);
          filter: invert(1) brightness(1.25);
          transform: scale(1.1);
        }
        input[type="date"]:focus {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(99, 102, 241, 0.95) 100%);
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.15) !important;
        }
        ::-webkit-datetime-edit { padding: 8px 0; font-weight: 700; color: #e0e7ff;}
        ::-webkit-datetime-edit-fields-wrapper { display: flex; gap: 4px; color: #c7d2fe;}
        ::-webkit-datetime-edit-text { color: #a5b4fc; font-weight: 600;}
        ::-webkit-datetime-edit-month-field,
        ::-webkit-datetime-edit-day-field,
        ::-webkit-datetime-edit-year-field { color: #e0e7ff; background: rgba(99, 102, 241, 0.2); padding: 4px 6px; border-radius: 4px; font-weight: 700;}
        ::-webkit-datetime-edit-month-field:focus,
        ::-webkit-datetime-edit-day-field:focus,
        ::-webkit-datetime-edit-year-field:focus { background: rgba(59, 130, 246, 0.4); color: #fbbf24; outline: 1px solid #3b82f6;}
        ::-webkit-calendar-picker-indicator::after { content: "📅"; font-size: 16px;}
      `}</style>

      {notify.open && (
        <div className={`fixed top-7 right-8 z-[60] px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all ${notify.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {notify.text}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-blue-400 to-purple-500 drop-shadow-lg">
            Students
          </h1>
          <button
            onClick={() => openModal(null)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition transform hover:scale-105"
          >
            + Add
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm"
          />
          <input
            type="text"
            placeholder="Admission No"
            value={searchAdmissionNo}
            onChange={(e) => setSearchAdmissionNo(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={searchPhnNumber}
            onChange={(e) => setSearchPhnNumber(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="px-3 py-1.5 rounded-xl border-2 border-transparent bg-white/20 text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-blue-400 shadow-md transition text-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-3xl shadow-2xl bg-white bg-opacity-20 border border-purple-400">
          <table className="w-full min-w-[900px] text-sm border-collapse border border-purple-500">
            <thead className="bg-gradient-to-r from-purple-500 to-blue-600">
              <tr>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Name</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Admission No</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Phone</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-sm">Email</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-center text-sm">Active</th>
                <th className="border border-purple-700 p-2 font-semibold text-white text-center text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-purple-300 text-sm">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-purple-400 text-sm">
                    No students found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredStudents.map((stu) => (
                  <tr key={stu.studentId || stu.AdmissionNo} className="hover:bg-gradient-to-r hover:from-purple-700 hover:to-blue-700 transition-colors cursor-pointer">
                    <td className="border border-purple-700 p-2 font-semibold text-sm">
                      {(stu.FirstName ?? "") + " " + (stu.LastName ?? "")}
                    </td>
                    <td className="border border-purple-700 p-2 text-sm">{stu.AdmissionNo ?? "-"}</td>
                    <td className="border border-purple-700 p-2 font-mono text-purple-300 text-sm">{stu.PhnNumber ?? "-"}</td>
                    <td className="border border-purple-700 p-2 text-sm">{stu.Email ?? "-"}</td>
                    <td className="border border-purple-700 p-2 text-center text-sm">
                      {stu.IsActive ? (
                        <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
                      ) : (
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-600"></span>
                      )}
                    </td>
                    <td className="border border-purple-700 p-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openModal(stu)}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs sm:text-sm font-semibold transition"
                          title="Edit Student"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(stu.studentId)}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs sm:text-sm font-semibold transition"
                          title="Delete Student"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {modalVisible && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md transition-opacity ${
              showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className={`bg-gradient-to-tr from-purple-900 via-blue-900 to-purple-800 rounded-3xl shadow-2xl border-2 border-purple-600 w-full max-w-7xl p-10 relative text-white font-sans flex flex-col transition-transform duration-300 ${
                showModal ? "scale-100" : "scale-95"
              }`}
              style={{ maxHeight: "90vh" }}
            >
              <form onSubmit={handleSaveStudent} className="flex flex-col gap-8 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Admission No */}
                  <div className="flex flex-col">
                    <label htmlFor="admissionNo" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Admission No <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <input
                      name="admissionNo"
                      value={form.admissionNo ?? ""}
                      onChange={handleFormChange}
                      required
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Admission No"
                    />
                  </div>
                  {/* First Name */}
                  <div className="flex flex-col">
                    <label htmlFor="firstName" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      First Name <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <input
                      name="firstName"
                      value={form.firstName ?? ""}
                      onChange={handleFormChange}
                      required
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="First Name"
                    />
                  </div>
                  {/* Last Name */}
                  <div className="flex flex-col">
                    <label htmlFor="lastName" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={form.lastName ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Last Name"
                    />
                  </div>
                  {/* Date of Birth with DatePicker */}
                  <div className="flex flex-col">
                    <label htmlFor="dateOfBirth" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <DatePicker
                      id="dateOfBirth"
                      selected={toDate(form.dateOfBirth)}
                      onChange={(date) =>
                        setForm((prev) => ({
                          ...prev,
                          dateOfBirth: date ? date.toISOString().split("T")[0] : "",
                        }))
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholderText="Select date"
                      dateFormat="yyyy-MM-dd"
                      showPopperArrow={false}
                      autoComplete="off"
                    />
                  </div>
                  {/* Gender Dropdown */}
                  <div className="flex flex-col">
                    <label htmlFor="genderId" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Gender
                    </label>
                    <select
                      name="genderId"
                      value={form.genderId ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select gender</option>
                      {getDropdownOptions("Gender").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Admission Date */}
                  <div className="flex flex-col">
                    <label htmlFor="admissionDate" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Admission Date
                    </label>
                    <input
                      name="admissionDate"
                      type="date"
                      value={form.admissionDate ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  {/* Adhar Number */}
                  <div className="flex flex-col">
                    <label htmlFor="adharNumber" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Adhar Number
                    </label>
                    <input
                      name="adharNumber"
                      value={form.adharNumber ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Adhar Number"
                    />
                  </div>
                  {/* Phone Number */}
                  <div className="flex flex-col">
                    <label htmlFor="phnNumber" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Phone Number <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <input
                      name="phnNumber"
                      value={form.phnNumber ?? ""}
                      onChange={handleFormChange}
                      required
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Phone Number"
                    />
                  </div>
                  {/* Email */}
                  <div className="flex flex-col">
                    <label htmlFor="email" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Email <span className="text-pink-400 ml-1">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email ?? ""}
                      onChange={handleFormChange}
                      required
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Email"
                    />
                  </div>
                  {/* Admission Type */}
                  <div className="flex flex-col">
                    <label htmlFor="admissionType" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Admission Type
                    </label>
                    <select
                      name="admissionType"
                      value={form.admissionType ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select type</option>
                      {getDropdownOptions("admissionType").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Religion */}
                  <div className="flex flex-col">
                    <label htmlFor="religion" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Religion
                    </label>
                    <select
                      name="religion"
                      value={form.religion ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select religion</option>
                      {getDropdownOptions("religion").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Country */}
                  <div className="flex flex-col">
                    <label htmlFor="country" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Country
                    </label>
                    <select
                      name="country"
                      value={form.country ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select country</option>
                      {getDropdownOptions("country").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* State */}
                  <div className="flex flex-col">
                    <label htmlFor="state" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      State
                    </label>
                    <select
                      name="state"
                      value={form.state ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select state</option>
                      {getDropdownOptions("state").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Caste */}
                  <div className="flex flex-col">
                    <label htmlFor="caste" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Caste
                    </label>
                    <select
                      name="caste"
                      value={form.caste ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select caste</option>
                      {getDropdownOptions("caste").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Sub Caste */}
                  <div className="flex flex-col">
                    <label htmlFor="subCaste" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Sub Caste
                    </label>
                    <select
                      name="subCaste"
                      value={form.subCaste ?? 0}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-blue-500 hover:border-blue-400 focus:border-blue-300 shadow-lg text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer appearance-none"
                    >
                      <option value={0} className="bg-purple-900 text-purple-300 font-semibold">Select sub caste</option>
                      {getDropdownOptions("subCaste").map((g) => (
                        <option key={g.LookupId} value={g.LookupId} className="bg-purple-900 text-white font-semibold">
                          {g.Meaning}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Address */}
                  <div className="flex flex-col">
                    <label htmlFor="adress" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Address
                    </label>
                    <input
                      name="adress"
                      value={form.adress ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Address"
                    />
                  </div>
                  {/* Pincode */}
                  <div className="flex flex-col">
                    <label htmlFor="pincode" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      value={form.pincode ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Pincode"
                    />
                  </div>
                  {/* Parent Mobile */}
                  <div className="flex flex-col">
                    <label htmlFor="parentMobileNo" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Parent Mobile
                    </label>
                    <input
                      name="parentMobileNo"
                      value={form.parentMobileNo ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Parent Mobile"
                    />
                  </div>
                  {/* Parent Email */}
                  <div className="flex flex-col">
                    <label htmlFor="parentEmail" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Parent Email
                    </label>
                    <input
                      name="parentEmail"
                      value={form.parentEmail ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Parent Email"
                    />
                  </div>
                  {/* Academic Year */}
                  <div className="flex flex-col">
                    <label htmlFor="acyear" className="mb-2 text-xs font-bold text-purple-300 select-none uppercase tracking-wide">
                      Academic Year
                    </label>
                    <input
                      name="acyear"
                      type="number"
                      value={form.acyear ?? ""}
                      onChange={handleFormChange}
                      className="px-4 py-3 rounded-lg bg-white/15 border-2 border-purple-600 hover:border-blue-500 focus:border-blue-400 shadow-md text-white placeholder-purple-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Academic Year"
                    />
                  </div>
                </div>
                {message && (
                  <div className="text-center text-pink-300 bg-purple-900 bg-opacity-60 rounded-xl py-3 px-4 font-bold animate-pulse shadow-lg border-2 border-pink-500 text-sm">
                    {message}
                  </div>
                )}
                <div className="flex justify-between items-center gap-6 mt-6 pt-6 border-t border-purple-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-8 py-3 text-base font-bold rounded-lg border-2 border-blue-500 bg-transparent hover:bg-blue-700/40 transition text-blue-300 hover:text-blue-100 shadow-md"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-10 py-3 text-base font-bold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl transition disabled:opacity-50 text-white uppercase tracking-wide"
                  >
                    {form.action === "update" ? "Update Student" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
            <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl border border-red-300 p-8 flex flex-col items-center gap-6 max-w-md animate-in">
              <h2 className="text-3xl font-bold text-red-600 select-none">Delete Student?</h2>
              <p className="text-gray-700 font-medium text-center text-sm">
                Are you sure you want to permanently delete this student record?
              </p>
              <div className="flex gap-4 mt-4 w-full">
                <button
                  onClick={handleDeleteStudent}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 text-sm"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
              </div>
              {message && (
                <div className="text-red-700 mt-2 py-2 px-4 text-xs sm:text-sm font-semibold bg-red-100 rounded-lg w-full text-center">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
