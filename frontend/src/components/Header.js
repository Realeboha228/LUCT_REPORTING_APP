import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import "./Header.css";

export default function Header() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Get title based on user role
  const getTitle = () => {
    if (!user) return "LUCT Reporting System";
    
    switch(user.role) {
      case "student":
        return "Student Portal";
      case "lecturer":
        return "Lecturer Portal";
      case "PRL":
        return "PRL Portal";
      case "PL":
        return "PL Portal";
      default:
        return "LUCT Reporting System";
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-left">
          <div className="title">
             {getTitle()}
          </div>
        </div>

        <nav className="header-right">
          {user ? (
            <>
              {/* Notification Bell - Show for all logged-in users */}
              <NotificationBell />

              <div className="user-menu">
                <button
                  className="user-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user.first_name} {user.last_name}</span>
                  <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
                    ▼
                  </span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="user-info">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="user-role">{user.role.toUpperCase()}</p>
                      {user.email && <p className="user-email">{user.email}</p>}
                    </div>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Logout Button - Always Visible */}
              <button className="logout-btn-direct" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <></>
          )}
        </nav>
      </div>
    </header>
  );
}