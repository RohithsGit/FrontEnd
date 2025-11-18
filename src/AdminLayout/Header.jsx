import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { FaBell, FaUserCircle } from "react-icons/fa";

const pages = [
  { name: "Students", id: "students" },
  { name: "Teachers", id: "teachers" },
  { name: "Subjects", id: "subjects" },
  { name: "Fees", id: "fees" },
  { name: "Fee Structures", id: "feestructures" },
  { name: "Classes", id: "classes" },
  { name: "Sections", id: "sections" },
];

const Students = lazy(() => import("./Students"));
const Teacher = lazy(() => import("./Teacher"));
const Fees = lazy(() => import("./Fees"));
const FeeStructures = lazy(() => import("./Feestructure"));

function SexySVNButton({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className={`flex items-center justify-center rounded-full
        ${open ? "bg-gradient-to-br from-purple-700 to-blue-700" : "bg-gradient-to-br from-blue-600 to-purple-600"}
        shadow-xl border-2 border-purple-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400
      `}
      style={{
        width: 52,
        height: 52,
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        className="block"
        style={{ transition: "transform 0.3s", transform: open ? "rotate(90deg)" : "" }}
      >
        <rect
          x="6"
          y={open ? "15" : "9"}
          width="20"
          height="3.5"
          rx="2"
          fill="#fff"
          transform={open ? "rotate(45 16 16)" : ""}
          style={{ transition: "all 0.25s cubic-bezier(.4,2,.4,1)" }}
        />
        <rect
          x="6"
          y="14.5"
          width="20"
          height="3.5"
          rx="2"
          fill="#fff"
          opacity={open ? 0 : 1}
          style={{ transition: "opacity 0.17s" }}
        />
        <rect
          x="6"
          y={open ? "15" : "20"}
          width="20"
          height="3.5"
          rx="2"
          fill="#fff"
          transform={open ? "rotate(-45 16 16)" : ""}
          style={{ transition: "all 0.25s cubic-bezier(.4,2,.4,1)" }}
        />
      </svg>
    </button>
  );
}

export default function Header() {
  const menuRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState("students");

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handlePageClick = (page) => {
    setSelectedPage(page.id);
    closeSidebar();
  };

  const renderPage = () => {
    switch (selectedPage) {
      case "students":
        return <Students />;
      case "teachers":
        return <Teacher />;
      case "fees":
        return <Fees />;
      case "feestructures":
        return <FeeStructures />;
      default:
        return <div className="p-6 text-purple-700">Page not found</div>;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 shadow-lg z-30 flex items-center justify-between h-16 px-4 text-white">
        <div>
          <SexySVNButton open={isSidebarOpen} onClick={() => setIsSidebarOpen((prev) => !prev)} />
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-6">
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full hover:bg-purple-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <FaBell className="w-6 h-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-pink-400 animate-ping"></span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-pink-600"></span>
          </button>
          <div className="flex items-center space-x-3 cursor-pointer hover:text-purple-300 transition">
            <FaUserCircle className="w-8 h-8" />
            <span className="font-semibold">Admin User</span>
          </div>
        </div>
      </header>

      {/* Sidebar - slides in from left, pushes content */}
      <nav
        ref={menuRef}
        className={`fixed top-16 left-0 h-full w-64 bg-gradient-to-b from-purple-800 via-blue-900 to-purple-900 shadow-2xl border-r-4 border-purple-600 transition-transform duration-300 ease-in-out z-20 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex flex-col mt-8 space-y-4 px-6 text-white">
          {pages.map((page) => (
            <li
              key={page.id}
              tabIndex={isSidebarOpen ? 0 : -1}
              onClick={() => handlePageClick(page)}
              className={`cursor-pointer rounded-lg px-4 py-3 font-semibold shadow-md transition duration-300
                ${
                  selectedPage === page.id
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "hover:bg-purple-700 hover:scale-105 transform text-purple-200"
                }`}
              role="button"
              aria-current={selectedPage === page.id ? "page" : undefined}
            >
              {page.name}
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content - only left side adjusts when sidebar opens */}
      <main className={`pt-16 transition-all duration-300 min-h-screen bg-gradient-to-tr from-purple-100 via-pink-100 to-blue-100 ${
        isSidebarOpen ? "ml-64" : "ml-0"
      }`}>
        <Suspense
          fallback={
            <div className="p-8 text-center text-purple-700 font-semibold animate-pulse">
              Loading {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}...
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </main>
    </>
  );
}
