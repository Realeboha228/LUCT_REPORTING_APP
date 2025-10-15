import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserTie, 
  FaUsers,
  FaClipboardList,
  FaChartLine,
  FaStar,
  FaShieldAlt 
} from "react-icons/fa";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaClipboardList />,
      title: "Smart Reporting",
      description: "Streamlined reporting system for lecturers to submit weekly class reports"
    },
    {
      icon: <FaChartLine />,
      title: "Real-Time Monitoring",
      description: "Track attendance, performance, and engagement across all streams"
    },
    {
      icon: <FaStar />,
      title: "360° Rating System",
      description: "Comprehensive feedback mechanism for continuous improvement"
    },
    {
      icon: <FaShieldAlt />,
      title: "Secure & Reliable",
      description: "Role-based access control ensuring data security and privacy"
    }
  ];

  const roles = [
    {
      icon: <FaUserGraduate />,
      title: "Students",
      description: "Mark attendance, rate lecturers, and submit feedback",
      color: "#e63946"
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Lecturers",
      description: "Submit reports, manage classes, and track student engagement",
      color: "#f77f00"
    },
    {
      icon: <FaUserTie />,
      title: "Principal Lecturers",
      description: "Review reports, monitor stream performance, and rate lecturers",
      color: "#06a77d"
    },
    {
      icon: <FaUsers />,
      title: "Program Leaders",
      description: "Oversee faculty operations, manage courses, and view analytics",
      color: "#001d3d"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="university-badge">
              <div className="badge-icon">🎓</div>
              <div className="badge-text">
                <span className="university-name">Limkokwing University</span>
                <span className="university-location">of Creative Technology - Lesotho</span>
              </div>
            </div>
            
            <h1 className="hero-title">
              Faculty Reporting System
            </h1>
            <p className="hero-subtitle">
              Faculty of Information Communication Technology
            </p>
            <p className="hero-description">
              Empowering academic excellence through innovative digital reporting and monitoring
            </p>
            
            <div className="hero-buttons">
              <button 
                className="btn btn-primary-hero"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
              <button 
                className="btn btn-outline-hero"
                onClick={() => navigate("/register")}
              >
                Register Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our System?</h2>
            <p className="section-subtitle">
              Built specifically for Limkokwing University's FICT department
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Four Portals, One System</h2>
            <p className="section-subtitle">
              Tailored dashboards for every role in the faculty
            </p>
          </div>

          <div className="roles-grid">
            {roles.map((role, index) => (
              <div 
                key={index} 
                className="role-card"
                style={{ borderTopColor: role.color }}
              >
                <div 
                  className="role-icon" 
                  style={{ backgroundColor: `${role.color}20`, color: role.color }}
                >
                  {role.icon}
                </div>
                <h3 className="role-title">{role.title}</h3>
                <p className="role-description">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">4</div>
              <div className="stat-label">Active Streams</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">16+</div>
              <div className="stat-label">Modules</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">20+</div>
              <div className="stat-label">Lecturers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Digital</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join the digital transformation of academic reporting at Limkokwing University
            </p>
            <div className="cta-buttons">
              <button 
                className="btn btn-light-cta"
                onClick={() => navigate("/login")}
              >
                Login to Your Account
              </button>
              <button 
                className="btn btn-outline-light-cta"
                onClick={() => navigate("/register")}
              >
                Create New Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>LUCT Reporting System</h3>
              <p>Faculty of Information Communication Technology</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#roles">Portals</a>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </div>
            <div className="footer-info">
              <p>Limkokwing University of Creative Technology</p>
              <p>Maseru, Lesotho</p>
              <p>&copy; 2025 All Rights Reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}