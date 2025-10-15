import React, { useState, useEffect } from "react";
import { Card, Form, Button, Tab, Tabs } from "react-bootstrap";
import axios from "axios";
import "./StudentDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  // Attendance State
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lectureDate, setLectureDate] = useState("");
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Rating State
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [ratings, setRatings] = useState({
    teachingAids: "",
    communication: "",
    punctuality: "",
    fairness: "",
    criticalThinking: ""
  });
  const [loadingRating, setLoadingRating] = useState(false);

  // Complaint State
  const [complaintModule, setComplaintModule] = useState(null);
  const [complaintType, setComplaintType] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [loadingComplaint, setLoadingComplaint] = useState(false);

  // Fetch student's enrolled modules on component mount
  useEffect(() => {
    fetchStudentModules();
    fetchStreamLecturers();
  }, []);

  const fetchStudentModules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/student/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(response.data);
    } catch (err) {
      console.error("Error fetching modules:", err);
      alert("Failed to fetch modules. Please try again.");
    }
  };

  const fetchStreamLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/student/stream-lecturers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLecturers(response.data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      alert("Failed to fetch lecturers. Please try again.");
    }
  };

  const handleModuleChange = (e) => {
    const moduleId = parseInt(e.target.value);
    const module = modules.find(m => m.id === moduleId);
    setSelectedModule(module);
  };

  const handleComplaintModuleChange = (e) => {
    const moduleId = parseInt(e.target.value);
    const module = modules.find(m => m.id === moduleId);
    setComplaintModule(module);
  };

  const handleLecturerChange = (e) => {
    const lecturerId = parseInt(e.target.value);
    const lecturer = lecturers.find(l => l.id === lecturerId);
    setSelectedLecturer(lecturer);
  };

  // ========================
  // ATTENDANCE SUBMISSION
  // ========================
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedModule) {
      alert("Please select a module first!");
      return;
    }

    if (!lectureDate) {
      alert("Please select a lecture date!");
      return;
    }

    setLoadingAttendance(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/student/attendance`,
        {
          module_id: selectedModule.id,
          lecturer_id: selectedModule.lecturer_id,
          lecture_date: lectureDate,
          status: "present"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Attendance marked successfully!");
      setLectureDate("");
      setSelectedModule(null);
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ========================
  // RATING SUBMISSION
  // ========================
  const handleRatingChange = (key, value) => {
    setRatings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLecturer) {
      alert("Please select a lecturer!");
      return;
    }

    // Validate all ratings are filled
    const allRatingsFilled = Object.values(ratings).every(val => val !== "");
    if (!allRatingsFilled) {
      alert("Please fill all rating fields!");
      return;
    }

    setLoadingRating(true);

    try {
      const token = localStorage.getItem("token");
      
      // Calculate average score
      const totalScore = Object.values(ratings).reduce((sum, val) => sum + parseInt(val), 0);
      const avgScore = (totalScore / Object.keys(ratings).length).toFixed(2);

      // Format feedback comments
      const comments = `Teaching Aids: ${ratings.teachingAids}/5, Communication: ${ratings.communication}/5, Punctuality: ${ratings.punctuality}/5, Fairness: ${ratings.fairness}/5, Critical Thinking: ${ratings.criticalThinking}/5`;

      await axios.post(
        `${API_URL}/reporting/ratings`,
        {
          ratee_id: selectedLecturer.id,
          score: avgScore,
          comments: comments,
          rating_type: "student_to_lecturer"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Feedback submitted successfully!");
      setSelectedLecturer(null);
      setRatings({
        teachingAids: "",
        communication: "",
        punctuality: "",
        fairness: "",
        criticalThinking: ""
      });
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setLoadingRating(false);
    }
  };

  // ========================
  // COMPLAINT SUBMISSION
  // ========================
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!complaintModule) {
      alert("Please select a module!");
      return;
    }

    if (!complaintType) {
      alert("Please select complaint type!");
      return;
    }

    if (!complaintDescription.trim()) {
      alert("Please describe your complaint!");
      return;
    }

    setLoadingComplaint(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/student/complaints`,
        {
          module_id: complaintModule.id,
          lecturer_id: complaintModule.lecturer_id,
          complaint_type: complaintType,
          description: complaintDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Complaint submitted successfully!");
      setComplaintModule(null);
      setComplaintType("");
      setComplaintDescription("");
    } catch (err) {
      console.error("Error submitting complaint:", err);
      alert(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoadingComplaint(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Student Dashboard</h2>

      {/* Tab Navigation */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="attendance" title="📋 Class Attendance">
          <Card className="p-4">
            <h4>Mark Class Attendance</h4>
            <form onSubmit={handleAttendanceSubmit}>
              {/* Module Dropdown */}
              <div className="mb-3">
                <label className="form-label">Select Module *</label>
                <select 
                  className="form-control" 
                  value={selectedModule?.id || ""}
                  onChange={handleModuleChange}
                  required
                >
                  <option value="">-- Select Module --</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_code} - {module.module_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Lecturer */}
              {selectedModule && (
                <div className="mb-3">
                  <label className="form-label">Lecturer</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedModule.lecturer_name || "No lecturer assigned"}
                    disabled
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </div>
              )}

              {/* Lecture Date */}
              <div className="mb-3">
                <label className="form-label">Lecture Date *</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={lectureDate}
                  onChange={(e) => setLectureDate(e.target.value)}
                  required
                />
              </div>

              <button 
                className="btn btn-success" 
                type="submit"
                disabled={loadingAttendance || !selectedModule}
              >
                {loadingAttendance ? "Marking..." : "Mark Attendance"}
              </button>
            </form>
          </Card>
        </Tab>

        <Tab eventKey="rating" title="Rate Lecturer">
          <Card className="p-4">
            <h4>Rate Your Lecturer</h4>
            <Form onSubmit={handleRatingSubmit}>
              {/* Lecturer Dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Select Lecturer *</Form.Label>
                <Form.Select
                  value={selectedLecturer?.id || ""}
                  onChange={handleLecturerChange}
                  required
                >
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.lecturer_name} ({lecturer.module_code})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select a lecturer from your stream
                </Form.Text>
              </Form.Group>

              {/* Rating Fields */}
              {[
                { key: "teachingAids", label: "Teaching Aids" },
                { key: "communication", label: "Communication" },
                { key: "punctuality", label: "Punctuality" },
                { key: "fairness", label: "Fairness in Grading" },
                { key: "criticalThinking", label: "Assignments Encouraged Critical Thinking" },
              ].map((item) => (
                <div className="mb-3 p-3 border rounded" key={item.key}>
                  <h6>{item.label}</h6>
                  <Form.Select
                    value={ratings[item.key]}
                    onChange={(e) => handleRatingChange(item.key, e.target.value)}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Form.Select>
                </div>
              ))}

              <Button variant="primary" type="submit" disabled={loadingRating || !selectedLecturer}>
                {loadingRating ? "Submitting..." : "Submit Feedback"}
              </Button>
            </Form>
          </Card>
        </Tab>

        <Tab eventKey="complaint" title="📢 Lecturer Complaint">
          <Card className="p-4">
            <h4>Submit Lecturer Complaint</h4>
            <form onSubmit={handleComplaintSubmit}>
              {/* Module Selection */}
              <div className="mb-3">
                <label className="form-label">Select Module *</label>
                <select 
                  className="form-control" 
                  value={complaintModule?.id || ""}
                  onChange={handleComplaintModuleChange}
                  required
                >
                  <option value="">-- Select Module --</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_code} - {module.module_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled Lecturer */}
              {complaintModule && (
                <div className="mb-3">
                  <label className="form-label">Lecturer</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={complaintModule.lecturer_name || "No lecturer assigned"}
                    disabled
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </div>
              )}

              {/* Complaint Type */}
              <div className="mb-3">
                <label className="form-label">Complaint Type *</label>
                <select 
                  className="form-control"
                  value={complaintType}
                  onChange={(e) => setComplaintType(e.target.value)}
                  required
                >
                  <option value="">-- Select Type --</option>
                  <option value="teaching_quality">Teaching Quality</option>
                  <option value="unprofessional_conduct">Unprofessional Conduct</option>
                  <option value="late_arrival">Late Arrival/Absence</option>
                  <option value="unfair_grading">Unfair Grading</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-control"
                  rows="5"
                  placeholder="Please describe your complaint in detail..."
                  value={complaintDescription}
                  onChange={(e) => setComplaintDescription(e.target.value)}
                  required
                />
              </div>

              <button 
                className="btn btn-warning" 
                type="submit"
                disabled={loadingComplaint || !complaintModule}
              >
                {loadingComplaint ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default StudentDashboard;