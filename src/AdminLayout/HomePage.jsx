import React, { useState } from "react";
import Header from "./Header";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-linear-to-br from-purple-300 via-purple-200 to-pink-200 relative">
      <Header isSidebarOpen={sidebarOpen} onToggleSidebar={setSidebarOpen} />
      {/* DO NOT render <Students/> here */}
    </div>
  );
}
