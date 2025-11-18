import Login from "./Login";
import "./index.css"; 
import Signup from "./Signup";
import AdminLayout from "./AdminLayout/HomePage";
import VideoGallery from "./AdminLayout/Inventry";
import Notifications from "./AdminLayout/Notifications";
import Profile from "./AdminLayout/Profile";
import TeacherForm from "./AdminLayout/TeacherForm";
import Teacher from "./AdminLayout/Teacher";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/Teacherlist" element={<Teacher />} />
        <Route path="/admin/add-teacher" element={<TeacherForm />} />
        {/* Admin Layout with nested routes */}
        <Route path="/admin" element={<AdminLayout />}>
          
          <Route path="inventory" element={<VideoGallery />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
       
        {/* Fallback: Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
