import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import PRLDashboard from "./pages/PRLDashboard";
import PLDashboard from "./pages/PLDashboard";
import LandingPage from "./pages/LandingPage";
import './Global.css';
import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeDashboard from "./pages/HomeDashBoard";

function AppContent() {
  const location = useLocation();
  
  // Hide header and footer on login, register, and landing page
  const hideHeader = location.pathname === "/" || 
                     location.pathname === "/login" || 
                     location.pathname === "/register";
  const hideFooter = hideHeader;

  return (
    <>
      {!hideHeader && <Header />}
      
      <div className="page-container">
        <div className="content">
          <Routes>
            {/* Landing Page as Home */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/home" element={<HomeDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/lecturer" element={<LecturerDashboard />} />
            <Route path="/prl" element={<PRLDashboard />} />
            <Route path="/pl" element={<PLDashboard />} />
            
            {/* Catch-all redirect to landing */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;