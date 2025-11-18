import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./userSlice";
import Layout from "./StudentLayout/Layout";
import AdminLayout from "./AdminLayout/Homepage";

function Login() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);

  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    setUserid("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://localhost:7256/api/Hostel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userid, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid username or password.");
        } else {
          setError("Server error. Please try again later.");
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.length === 1 && result[0].ErrorMessage) {
        setError(result[0].ErrorMessage);
        setLoading(false);
        return;
      }

      const userData = result[0];
      dispatch(setUser(userData));
      setLoading(false);
    } catch (ex) {
      setError("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (user) {
    const role = user.Role?.toLowerCase().trim();

    if (role === "student")
      return (
        <>
          <Layout user={user} />
        </>
      );

    if (role === "employee" || role === "faculty")
      return (
        <>
          <AdminLayout user={user} />
        </>
      );

    return <div>Role not recognized. Please contact support.</div>;
  }

  // Login form if no user logged in
  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen min-w-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-[length:400%_400%] animate-[gradient_15s_ease_infinite] overflow-hidden z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 opacity-50 blur-3xl pointer-events-none bg-[length:400%_400%] animate-[gradient_12s_ease_infinite]" />

      <div className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-400/40 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6 tracking-wide">
          Welcome Back <span role="img" aria-label="wave">👋</span>
        </h2>

        {error && <div className="text-red-500 text-center mb-4 animate-pulse">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-indigo-50/40 outline-none transition duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-400 bg-indigo-50/40 outline-none transition duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="ml-1 text-green-600 hover:underline hover:text-green-800 transition-all">
            Sign up
          </Link>
        </p>
      </div>

      {/* Animations: Tailwind v4+ supports arbitrary keyframes via animate-[name_time_function] */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradient_12s_ease_infinite {
          0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Login;
