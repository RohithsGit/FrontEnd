import React, { useState, useEffect } from "react";

const API_URL = "https://localhost:7256/api/School/fee";

const initialFeeForm = {
  action: "create",
  feeId: 0,
  feeName: "",
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFeeName, setSearchFeeName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFeeForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [notify, setNotify] = useState({ open: false, type: "", text: "" });

  useEffect(() => {
    fetchFees();
  }, []);

  async function fetchFees() {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      const data = await response.json();
      setFees(data);
      setLoading(false);
    } catch {
      setMessage("Error fetching fees.");
      setFees([]);
      setLoading(false);
    }
  }

  function openModal(fee) {
    if (fee) {
      setForm({
        ...initialFeeForm,
        action: "update",
        feeId: fee.FeeId || 0,
        feeName: fee.FeeName || "",
      });
      setEditingId(fee.FeeId || 0);
    } else {
      setForm({ ...initialFeeForm, action: "create" });
      setEditingId(null);
    }
    setMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(initialFeeForm);
    setMessage("");
    setModalLoading(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  }

  function handleNotify(type, text) {
    setNotify({ open: true, type, text });
    setTimeout(() => setNotify({ open: false, type: "", text: "" }), 3000);
  }

  async function handleSaveFee(e) {
    e.preventDefault();
    setModalLoading(true);
    setMessage("");
    if (!form.feeName) {
      setMessage("Fee Name is required!");
      setModalLoading(false);
      return;
    }
    const reqBody = {
      Action: form.action,
      FeeId: form.feeId,
      FeeName: form.feeName,
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
        fetchFees();
        setTimeout(closeModal, 1000);
      } else {
        handleNotify(
          "error",
          res[0]?.ValidationMessage || "Database validation error"
        );
        setMessage(res[0]?.ValidationMessage || "Database validation error");
      }
    } catch (e) {
      handleNotify("error", "Server error!");
      setMessage("Server error!");
    }
    setModalLoading(false);
  }

  async function handleDeleteFee() {
    setModalLoading(true);
    setMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "delete",
          FeeId: deleteId,
        }),
      });
      const res = await response.json();
      if (res[0]?.SuccesCode === 1) {
        handleNotify("success", "Record successfully deleted");
        setMessage("Deleted!");
        fetchFees();
        setTimeout(() => {
          setDeleteId(null);
          setModalLoading(false);
        }, 600);
      } else {
        handleNotify(
          "error",
          res[0]?.ValidationMessage || "Delete failed"
        );
        setMessage(res[0]?.ValidationMessage || "Delete failed");
        setModalLoading(false);
      }
    } catch {
      handleNotify("error", "Server error!");
      setMessage("Server error!");
      setModalLoading(false);
    }
  }

  // Filter fees by name (case insensitive)
  const filteredFees = fees.filter((f) =>
    (f.FeeName ?? "").toLowerCase().includes(searchFeeName.toLowerCase())
  );

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

      <div className="w-full max-w-4xl mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-500 to-blue-500 drop-shadow-xl tracking-tighter">
            Fees
          </h1>
          <button
            onClick={() => openModal(null)}
            className="bg-gradient-to-r from-fuchsia-600 via-purple-500 to-blue-500 hover:from-fuchsia-700 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            + Add Fee
          </button>
        </div>

        {/* Search Field */}
        <div className="max-w-md mb-8">
          <input
            type="text"
            value={searchFeeName}
            onChange={(e) => setSearchFeeName(e.target.value ?? "")}
            placeholder="Search Fee Name"
            className="w-full px-4 py-3 rounded-lg border-2 border-green-300 shadow-md text-green-900 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
          />
        </div>

        {/* Fee Table */}
        <div className="overflow-x-auto rounded-3xl shadow-xl bg-white bg-opacity-70">
          <table className="w-full min-w-[600px] text-sm border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-purple-200 to-pink-100">
              <tr>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Fee Name</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Created Date</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Modified Date</th>
                <th className="border border-gray-300 p-3 font-semibold text-purple-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-purple-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && filteredFees.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-purple-400">
                    No fees found.
                  </td>
                </tr>
              )}
              {filteredFees.map((f) => (
                <tr
                  key={f.FeeId || Math.random()}
                  className="hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 transition"
                >
                  <td className="border border-gray-300 p-3 text-purple-800 font-semibold">{f.FeeName ?? "-"}</td>
                  <td className="border border-gray-300 p-3 text-purple-500">{f.CreatedDt ? f.CreatedDt.split("T")[0] : "-"}</td>
                  <td className="border border-gray-300 p-3 text-pink-700 font-mono">{f.ModifiedDt ? (typeof f.ModifiedDt === "string" ? f.ModifiedDt.split("T")[0] : "-") : "-"}</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => openModal(f)}
                      className="mx-1 bg-purple-100 text-purple-700 px-2 py-1 rounded shadow hover:bg-purple-200 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(f.FeeId)}
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
          className={`relative bg-white/95 border-2 border-purple-400 shadow-2xl rounded-2xl w-[95vw] max-w-lg p-6 flex flex-col gap-4 overflow-y-auto transition-opacity duration-300 ease-in-out transform ${
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
          <form onSubmit={handleSaveFee} className="flex flex-col gap-4">
            <h2 className="text-3xl font-extrabold text-purple-700 mb-4">
              {form.action === "update" ? "Edit Fee" : "Add Fee"}
            </h2>
            <label>
              <span className="text-purple-600 font-semibold">Fee Name *</span>
              <input
                name="feeName"
                value={form.feeName ?? ""}
                onChange={handleFormChange}
                required
                className="w-full rounded-md border border-purple-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </label>
            <button
              type="submit"
              disabled={modalLoading}
              className="mx-auto mt-6 bg-red-600 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 transition"
            >
              {form.action === "update" ? "Update Fee" : "Add Fee"}
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
            <h2 className="text-2xl font-bold text-pink-600">Delete Fee?</h2>
            <div className="text-gray-500 font-medium">Are you sure you want to delete this fee?</div>
            <div className="flex gap-8 mt-2">
              <button
                onClick={handleDeleteFee}
                className="bg-red-500 text-white font-bold px-7 py-2 rounded-xl shadow-lg hover:bg-red-600 transition text-lg"
                disabled={modalLoading}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="bg-purple-50 text-purple-700 font-bold px-7 py-2 rounded-xl hover:bg-purple-200 transition text-lg"
                disabled={modalLoading}
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
        input, label {
          backdrop-filter: none !important;
        }
      `}</style>
    </div>
  );
}
