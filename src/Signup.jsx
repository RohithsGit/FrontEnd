import { useState } from "react";
import {Link} from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password2: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.password2) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }
    // API logic here
    alert("Signup success! Welcome, " + form.name);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen min-w-full bg-linear-to-br from-indigo-400 via-purple-400 to-pink-400 bg-size-[400%_400%] animate-[gradient_15s_ease_infinite] overflow-hidden" style={{ zIndex: 0 }}>
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-indigo-600 to-cyan-400 opacity-40 blur-3xl animate-[gradient_12s_ease_infinite]" />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 animate-[fadeIn_1.4s_ease-out]">
        <h2 className="text-3xl font-extrabold text-center text-purple-600 mb-6 tracking-wide">
          Create Account <span aria-label="sparkle" role="img">✨</span>
        </h2>

        {error && <div className="text-red-500 text-center mb-4 animate-pulse">{error}</div>}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-400 bg-purple-50/40 outline-none transition duration-300"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-400 bg-purple-50/40 outline-none transition duration-300"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-400 bg-purple-50/40 outline-none transition duration-300"
              placeholder="Create a password"
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-400 bg-purple-50/40 outline-none transition duration-300"
              placeholder="Re-enter password"
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-semibold bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md hover:from-purple-600 hover:to-pink-600 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-4">
  Don’t have an account?
  <Link
    to="/"
    className="ml-1 text-indigo-500 hover:underline hover:text-indigo-600 transition-all"
  >
    Sign up
  </Link>
</p>
      </div>
      {/* Inline keyframes for animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Signup;
