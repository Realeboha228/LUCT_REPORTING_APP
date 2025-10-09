import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = { role };

      if (role === "student") {
        data = { role, name, student_id: studentId };
      } else {
        data = { role, email, password };
      }

      const res = await loginUser(data);
      localStorage.setItem("token", res.token);

      if (res.user.role === "student") navigate("/student");
      else if (res.user.role === "lecturer") navigate("/lecturer");
      else if (res.user.role === "PRL") navigate("/prl");
      else if (res.user.role === "PL") navigate("/pl");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <h2 className="text-center mb-5">Login</h2>
      <form onSubmit={handleSubmit} className="border p-5 shadow rounded bg-light">
        {/* Role Select */}
        <div className="mb-4">
          <label className="form-label fw-bold">Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="PRL">PRL</option>
            <option value="PL">PL</option>
          </select>
        </div>

        {/* Student Fields */}
        {role === "student" && (
          <>
            <div className="mb-4">
              <label className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Student ID</label>
              <input
                type="text"
                className="form-control"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Lecturer/PRL/PL Fields */}
        {(role === "lecturer" || role === "PRL" || role === "PL") && (
          <>
            <div className="mb-4">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label className="form-check-label" htmlFor="showPassword">
                  Show Password
                </label>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>

      <p className="text-center mt-4">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
