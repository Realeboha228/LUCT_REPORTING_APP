import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { FaArrowLeft } from "react-icons/fa";
import "./Auth.css";

export default function Login() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!role || !username || !password) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      const res = await loginUser({ username, password, role });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Route based on role
      if (res.user.role === "student") navigate("/student");
      else if (res.user.role === "lecturer") navigate("/lecturer");
      else if (res.user.role === "PRL") navigate("/prl");
      else if (res.user.role === "PL") navigate("/pl");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Back to Home Button */}
      <div className="back-to-home">
        <button 
          className="btn-back-home"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Back to Home
        </button>
      </div>

      <div className="auth-card">
        {/* University Badge */}
        <div className="auth-university-badge">
          <div className="badge-icon">🎓</div>
          <div className="badge-text">
            <span className="university-name">Limkokwing University</span>
            <span className="university-location">FICT Reporting System</span>
          </div>
        </div>

        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Select */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              <span className="required">*</span> Role
            </label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="PRL">Principal Lecturer (PRL)</option>
              <option value="PL">Program Leader (PL)</option>
            </select>
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <span className="required">*</span> Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="required">*</span> Password
            </label>
            <div className="password-input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border"></span> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
}