import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import PRLDashboard from "./pages/PRLDashboard";
import PLDashboard from "./pages/PLDashboard";
import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Header /> {/* Always visible */}

      <div className="page-container">
        <div className="content">
          <Routes>
           
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/lecturer" element={<LecturerDashboard />} />
            <Route path="/prl" element={<PRLDashboard />} />
            <Route path="/pl" element={<PLDashboard />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
