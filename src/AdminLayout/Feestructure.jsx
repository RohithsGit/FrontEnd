import React, { useState, useEffect } from "react";

const API_URL = "https://localhost:7256/api/School/feestructure";
const DROPDOWN_URL = "https://localhost:7256/api/School/GenericDropDown";

const initialFeeStructureForm = {
  action: "create",
  feeStructureId: 0,
  feeId: 0,
  academicYearId: 0,
  classId: 0,
  description: "",
  amount: 0,
  frequency: "",
};

export default function FeeStructure() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownsReady, setDropdownsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFeeStructureForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [notify, setNotify] = useState({ open: false, type: "", text: "" });

  useEffect(() => {
    async function fetchAll() {
      await fetchDropdowns();
      await fetchFeeStructures();
    }
    fetchAll();
  }, []);

  async function fetchDropdowns() {
    try {
      const res = await fetch(DROPDOWN_URL);
      const data = await res.json();
      setDropdowns(data);
      setDropdownsReady(true);
    } catch {
      setDropdowns([]);
      setDropdownsReady(true);
    }
  }

  async function fetchFeeStructures() {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      setFeeStructures(data);
      setLoading(false);
    } catch {
      setMessage("Error fetching fee structures.");
      setFeeStructures([]);
      setLoading(false);
    }
  }

  function getDropdownOptions(name) {
    if (!dropdownsReady) return [];
    return dropdowns.filter(
      (d) => d.Name.toLowerCase() === name.toLowerCase()
    );
  }

  function openModal(feeStructure) {
    if (feeStructure) {
      setForm({
        action: "update",
        feeStructureId: feeStructure.FeeStructureId || 0,
        feeId: feeStructure.FeeId || 0,
        academicYearId: feeStructure.AcademicYearId || 0,
        classId: feeStructure.ClassId || 0,
        description: feeStructure.Description || "",
        amount: feeStructure.Amount || 0,
        frequency: feeStructure.Frequency || "",
      });
      setEditingId(feeStructure.FeeStructureId || 0);
    } else {
      setForm({ ...initialFeeStructureForm, action: "create" });
      setEditingId(null);
    }
    setMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(initialFeeStructureForm);
    setMessage("");
    setModalLoading(false);
  }

  function handleFormChange(e) {
    const { name, value, type } = e.target;
    let val = value;
    if (type === "number") val = Number(value);
    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  }

  function handleNotify(type, text) {
    setNotify({ open: true, type, text });
    setTimeout(() => setNotify({ open: false, type: "", text: "" }), 3000);
  }

  async function handleSaveFeeStructure(e) {
    e.preventDefault();
    setModalLoading(true);
    setMessage("");

    if (!form.feeId || !form.academicYearId || !form.classId || !form.amount) {
      setMessage("Please fill all required fields!");
      setModalLoading(false);
      return;
    }

    const reqBody = {
      Action: form.action,
      FeeStructureId: form.feeStructureId,
      FeeId: form.feeId,
      AcademicYearId: form.academicYearId,
      ClassId: form.classId,
      Description: form.description,
      Amount: form.amount,
      Frequency: form.frequency,
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
        fetchFeeStructures();
        setTimeout(closeModal, 1000);
      } else {
        handleNotify("error", res[0]?.ValidationMessage || "Database validation error");
        setMessage(res[0]?.ValidationMessage || "Database validation error");
      }
    } catch (e) {
      handleNotify("error", "Server error!");
      setMessage("Server error!");
    }
    setModalLoading(false);
  }

  async function handleDeleteFeeStructure() {
    setModalLoading(true);
    setMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "delete",
          FeeStructureId: deleteId,
        }),
      });
      const res = await response.json();
      if (res[0]?.SuccesCode === 1) {
        handleNotify("success", "Record successfully deleted");
        setMessage("Deleted!");
        fetchFeeStructures();
        setTimeout(() => {
          setDeleteId(null);
          setModalLoading(false);
        }, 600);
      } else {
        handleNotify("error", res[0]?.ValidationMessage || "Delete failed");
        setMessage(res[0]?.ValidationMessage || "Delete failed");
        setModalLoading(false);
      }
    } catch {
      handleNotify("error", "Server error!");
      setMessage("Server error!");
      setModalLoading(false);
    }
  }

  // Filter feeStructures by FeeName, ClassName or YearName case-insensitive
  const filteredFeeStructures = feeStructures.filter((fs) => {
    const search = searchName.toLowerCase();
    return (
      (fs.FeeName ?? "").toLowerCase().includes(search) ||
      (fs.ClassName ?? "").toLowerCase().includes(search) ||
      (fs.YearName ?? "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen w-full px-4 py-10 bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 flex flex-col items-center transition-colors">
      {/* Notification Toast */}
      {notify.open && (
        <div
          className={`fixed top-7 right-8 z-[2000] px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all ${
            notify.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          } animate-fadeIn`}
        >
          {notify.text}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-500 to-blue-500 drop-shadow-xl tracking-tighter">
            Fee Structures
          </h1>
          <button
            onClick={() => openModal(null)}
            className="bg-gradient-to-r from-fuchsia-600 via-purple-500 to-blue-500 hover:from-fuchsia-700 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            + Add Fee Structure
          </button>
        </div>

        {/* Search Input */}
        <div className="max-w-md mb-8">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value ?? "")}
            placeholder="Search by Fee, Class or Year"
            className="w-full px-4 py-3 rounded-lg border-2 border-green-300 shadow-md text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
          />
        </div>

        {/* FeeStructure Table */}
        <div className="overflow-x-auto rounded-3xl shadow-xl bg-white bg-opacity-70">
          <table className="w-full min-w-[900px] text-sm border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-purple-200 to-pink-100">
              <tr>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Fee Name</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Year</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Class</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Description</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Amount</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Frequency</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-purple-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredFeeStructures.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-purple-400">
                    No fee structures found.
                  </td>
                </tr>
              )}
              {filteredFeeStructures.map((fs) => (
                <tr
                  key={fs.FeeStructureId}
                  className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition"
                >
                  <td className="border border-gray-300 p-3 text-purple-800 font-semibold">{fs.FeeName ?? "-"}</td>
                  <td className="border border-gray-300 p-3">{fs.YearName ?? "-"}</td>
                  <td className="border border-gray-300 p-3">{fs.ClassName ?? "-"}</td>
                  <td className="border border-gray-300 p-3">{fs.Description || "-"}</td>
                  <td className="border border-gray-300 p-3">{fs.Amount ?? "-"}</td>
                  <td className="border border-gray-300 p-3">{fs.Frequency || "-"}</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => openModal(fs)}
                      className="mx-1 bg-purple-100 text-purple-700 px-2 py-1 rounded shadow hover:bg-purple-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(fs.FeeStructureId)}
                      className="mx-1 bg-pink-100 text-pink-700 px-2 py-1 rounded shadow hover:bg-pink-200 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[1000] transition-opacity ${
          showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!showModal}
      />
      {/* Modal Content */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[1100] ${
          showModal ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`relative bg-white/95 border-2 border-purple-400 shadow-2xl rounded-2xl w-[95vw] max-w-[900px] p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh] transition-opacity duration-300 ease-in-out transform ${
            showModal ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
            title="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 -rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l-7 7 7 7" />
            </svg>
            Back
          </button>

          <form onSubmit={handleSaveFeeStructure} className="flex flex-col gap-4">
            <h2 className="text-3xl font-extrabold text-purple-700 mb-4">
              {form.action === "update" ? "Edit Fee Structure" : "Add Fee Structure"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Fee *</span>
                <select
                  name="feeId"
                  value={form.feeId}
                  onChange={handleFormChange}
                  required
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value={0} disabled>
                    Select Fee
                  </option>
                  {getDropdownOptions("Fees").map((d) => (
                    <option key={d.LookupId} value={d.LookupId}>
                      {d.Meaning}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Academic Year *</span>
                <select
                  name="academicYearId"
                  value={form.academicYearId}
                  onChange={handleFormChange}
                  required
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value={0} disabled>
                    Select Academic Year
                  </option>
                  {getDropdownOptions("AcademicYear").map((d) => (
                    <option key={d.LookupId} value={d.LookupId}>
                      {d.Meaning}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Class *</span>
                <select
                  name="classId"
                  value={form.classId}
                  onChange={handleFormChange}
                  required
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value={0} disabled>
                    Select Class
                  </option>
                  {getDropdownOptions("Class").map((d) => (
                    <option key={d.LookupId} value={d.LookupId}>
                      {d.Meaning}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Description</span>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Optional"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Amount *</span>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleFormChange}
                  min={0}
                  step="0.01"
                  required
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter amount"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-purple-600 font-semibold">Frequency</span>
                <input
                  name="frequency"
                  value={form.frequency}
                  onChange={handleFormChange}
                  placeholder="Optional"
                  className="rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={modalLoading}
              className="mx-auto mt-6 bg-red-600 text-white font-semibold px-8 py-3 rounded-2xl shadow-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 transition"
            >
              {form.action === "update" ? "Update Fee Structure" : "Add Fee Structure"}
            </button>
            {message && (
              <div className="text-center mt-4 text-purple-700 bg-pink-50 py-2 rounded-lg font-semibold animate-pulse">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-red-200 flex flex-col items-center gap-8 animate-fadeIn scale-95 max-w-md">
            <h2 className="text-2xl font-bold text-pink-600">Delete Fee Structure?</h2>
            <div className="text-gray-500 font-medium">Are you sure you want to delete this fee structure?</div>
            <div className="flex gap-8 mt-2">
              <button
                onClick={handleDeleteFeeStructure}
                disabled={modalLoading}
                className="bg-red-500 text-white font-bold px-7 py-2 rounded-xl shadow-lg hover:bg-red-600 transition text-lg"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={modalLoading}
                className="bg-purple-50 text-purple-700 font-bold px-7 py-2 rounded-xl hover:bg-purple-200 transition text-lg"
              >
                Cancel
              </button>
            </div>
            {message && <div className="text-base mt-2 py-2 px-3 text-pink-700">{message}</div>}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px);}
          to {opacity:1; transform:translateY(0);}
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.4,2,0.3,1) forwards; }
        body, html {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        body::-webkit-scrollbar,
        html::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        body::-webkit-scrollbar-track,
        html::-webkit-scrollbar-track {
          background: transparent;
        }
        body::-webkit-scrollbar-thumb,
        html::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #9f7aea 0%, #b794f4 100%);
          border-radius: 10px;
          opacity: 0.5;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: opacity 0.3s ease, box-shadow 0.3s ease;
        }
        body::-webkit-scrollbar-thumb:hover,
        html::-webkit-scrollbar-thumb:hover {
          opacity: 1;
          box-shadow: 0 0 8px 3px #d53f8c;
        }
        input, select, label {
          backdrop-filter: none !important;
        }
      `}</style>
    </div>
  );
}
