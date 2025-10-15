import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, getStreams } from "../api/auth";
import { FaArrowLeft } from "react-icons/fa";
import "./Auth.css";

export default function Register() {
  const [role, setRole] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPassword_confirm] = useState("");
  const [student_number, setStudent_number] = useState("");
  const [primary_stream_id, setPrimary_stream_id] = useState("");
  const [selectedStreams, setSelectedStreams] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [allStreams, setAllStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch streams on component mount
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const data = await getStreams();
        setAllStreams(data);
      } catch (err) {
        console.error("Error fetching streams:", err);
      }
    };
    fetchStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle lecturer stream selection
  const handleStreamToggle = (streamId) => {
    setSelectedStreams((prev) =>
      prev.includes(streamId)
        ? prev.filter((id) => id !== streamId)
        : [...prev, streamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!role || !first_name || !last_name || !username) {
        setError("First name, last name, username, and role are required");
        setLoading(false);
        return;
      }

      if (password !== password_confirm) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      let data = {
        role,
        first_name,
        last_name,
        username,
        password,
        password_confirm,
      };

      // Student registration
      if (role === "student") {
        if (!student_number || !primary_stream_id) {
          setError("Student number and stream are required");
          setLoading(false);
          return;
        }
        data = { ...data, student_number, primary_stream_id };
      }

      // Lecturer/PRL/PL registration
      if (role === "lecturer" || role === "PRL" || role === "PL") {
        if (!email) {
          setError("Email is required");
          setLoading(false);
          return;
        }

        if (selectedStreams.length === 0) {
          setError("Please select at least one stream");
          setLoading(false);
          return;
        }

        data = {
          ...data,
          email,
          primary_stream_id: selectedStreams[0] || null,
          streams: selectedStreams,
        };
      }

      await registerUser(data);
      alert("Registered successfully! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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

      <div className="auth-card auth-card-large">
        {/* University Badge */}
        <div className="auth-university-badge">
          <div className="badge-icon">🎓</div>
          <div className="badge-text">
            <span className="university-name">Limkokwing University</span>
            <span className="university-location">FICT Reporting System</span>
          </div>
        </div>

        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Register to access the system</p>
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

          {/* First Name */}
          <div className="form-group">
            <label htmlFor="first_name" className="form-label">
              <span className="required">*</span> First Name
            </label>
            <input
              id="first_name"
              type="text"
              className="form-control"
              placeholder="Enter first name"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
              required
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="last_name" className="form-label">
              <span className="required">*</span> Last Name
            </label>
            <input
              id="last_name"
              type="text"
              className="form-control"
              placeholder="Enter last name"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
              required
            />
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
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Student Fields */}
          {role === "student" && (
            <>
              <div className="form-group">
                <label htmlFor="student_number" className="form-label">
                  <span className="required">*</span> Student Number
                </label>
                <input
                  id="student_number"
                  type="text"
                  className="form-control"
                  placeholder="Enter student number"
                  value={student_number}
                  onChange={(e) => setStudent_number(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="student_stream" className="form-label">
                  <span className="required">*</span> Stream
                </label>
                <select
                  id="student_stream"
                  className="form-control"
                  value={primary_stream_id}
                  onChange={(e) => setPrimary_stream_id(e.target.value)}
                  required
                >
                  <option value="">Select your stream</option>
                  {allStreams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.stream_name} ({stream.stream_code})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Lecturer/PRL/PL Fields */}
          {(role === "lecturer" || role === "PRL" || role === "PL") && (
            <>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <span className="required">*</span> Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> Select Streams (can choose multiple)
                </label>
                <div className="streams-checkbox-group">
                  {allStreams.map((stream) => (
                    <div key={stream.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`stream_${stream.id}`}
                        checked={selectedStreams.includes(stream.id)}
                        onChange={() => handleStreamToggle(stream.id)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`stream_${stream.id}`}
                      >
                        {stream.stream_name} ({stream.stream_code})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

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
                placeholder="Enter password (min 6 characters)"
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
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="password_confirm" className="form-label">
              <span className="required">*</span> Confirm Password
            </label>
            <input
              id="password_confirm"
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm password"
              value={password_confirm}
              onChange={(e) => setPassword_confirm(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border"></span> Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}