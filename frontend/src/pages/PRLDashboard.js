import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function PRLDashboard() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("courses");

  // State for all tabs
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [prlFeedback, setPrlFeedback] = useState("");
  const [lecturers, setLecturers] = useState([]);
  const [streamInfo, setStreamInfo] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [lecturerRating, setLecturerRating] = useState({
    score: "",
    comments: ""
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------
  // Fetch data on mount
  // ------------------------
  useEffect(() => {
    fetchStreamInfo();
    fetchCourses();
    fetchLecturers();
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "classes") {
      fetchClasses();
    }
  }, [activeTab]);

  // ------------------------
  // Fetch PRL's Stream Info
  // ------------------------
  const fetchStreamInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/prl/stream`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStreamInfo(data);
    } catch (err) {
      console.error("Error fetching stream info:", err);
    }
  };

  // ------------------------
  // Fetch Courses in PRL's Stream
  // ------------------------
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/prl/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Fetch Classes (Modules with details)
  // ------------------------
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/prl/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Fetch Reports
  // ------------------------
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/prl/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Fetch Lecturers in PRL's Stream
  // ------------------------
  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_URL}/prl/lecturers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLecturers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      setLecturers([]);
    }
  };

  // ------------------------
  // Submit Feedback on Report
  // ------------------------
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReport) {
      alert("Please select a report first!");
      return;
    }

    if (!prlFeedback.trim()) {
      alert("Please enter feedback!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/prl/reports/${selectedReport.id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prl_feedback: prlFeedback })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Feedback submitted successfully!");
        setPrlFeedback("");
        setSelectedReport(null);
        fetchReports(); // Refresh reports
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Error submitting feedback");
    }
  };

  // ------------------------
  // Rate Lecturer
  // ------------------------
  const handleLecturerSelect = (e) => {
    const lecturerId = parseInt(e.target.value);
    const lecturer = lecturers.find(l => l.id === lecturerId);
    setSelectedLecturer(lecturer);
  };

  const handleRatingChange = (e) => {
    setLecturerRating({ ...lecturerRating, [e.target.name]: e.target.value });
  };

  const submitLecturerRating = async (e) => {
    e.preventDefault();

    if (!selectedLecturer) {
      alert("Please select a lecturer");
      return;
    }

    if (!lecturerRating.score) {
      alert("Please provide a rating score");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/prl/rate-lecturer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lecturer_id: selectedLecturer.id,
          score: lecturerRating.score,
          comments: lecturerRating.comments
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Rating submitted successfully!");
        setSelectedLecturer(null);
        setLecturerRating({ score: "", comments: "" });
      } else {
        alert(data.message || "Failed to submit rating");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Error submitting rating");
    }
  };

  // ------------------------
  // Render Tab Content
  // ------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div>
            {streamInfo && (
              <div className="alert alert-info mb-4">
                <h5 className="mb-2">Your Stream: {streamInfo.stream_name} ({streamInfo.stream_code})</h5>
                <p className="mb-0">Viewing all courses and lecturers in your stream</p>
              </div>
            )}

            <h5>Courses & Lecturers Under Your Stream</h5>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="alert alert-warning">
                No courses found in your stream yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Module Code</th>
                      <th>Module Name</th>
                      <th>Class</th>
                      <th>Lecturer</th>
                      <th>Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td><strong>{course.module_code}</strong></td>
                        <td>{course.module_name}</td>
                        <td>{course.class_name || "N/A"}</td>
                        <td>
                          {course.lecturer_name || (
                            <span className="text-danger">Not Assigned</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-primary">
                            {course.stream_code}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "classes":
        return (
          <div>
            {streamInfo && (
              <div className="alert alert-info mb-4">
                <h5 className="mb-2">Classes in {streamInfo.stream_name}</h5>
              </div>
            )}

            <h5>All Classes in Your Stream</h5>
            
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : classes.length === 0 ? (
              <div className="alert alert-warning">
                No classes found in your stream yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Module Code</th>
                      <th>Module Name</th>
                      <th>Class Name</th>
                      <th>Lecturer</th>
                      <th>Total Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls) => (
                      <tr key={cls.id}>
                        <td><strong>{cls.module_code}</strong></td>
                        <td>{cls.module_name}</td>
                        <td>{cls.class_name || "N/A"}</td>
                        <td>{cls.lecturer_name || "Not Assigned"}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {cls.total_students || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "reports":
        return (
          <div>
            {streamInfo && (
              <div className="alert alert-info mb-4">
                <h5 className="mb-2">Reports from {streamInfo.stream_name} Lecturers</h5>
              </div>
            )}

            <h5>Lecturer Reports</h5>
            
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="alert alert-warning">
                No reports submitted yet.
              </div>
            ) : (
              <>
                <div className="card p-3 mb-4">
                  <h6>Click on a report to select it for feedback</h6>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Module</th>
                          <th>Lecturer</th>
                          <th>Week</th>
                          <th>Topic</th>
                          <th>Students</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            style={{
                              cursor: "pointer",
                              backgroundColor: selectedReport?.id === report.id ? "#e3f2fd" : "",
                            }}
                          >
                            <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                            <td>
                              <strong>{report.module_code}</strong><br/>
                              <small className="text-muted">{report.module_name}</small>
                            </td>
                            <td>{report.lecturer_name}</td>
                            <td>Week {report.week_of_reporting}</td>
                            <td>{report.topic_taught}</td>
                            <td>{report.actual_students_present}</td>
                            <td>
                              <span className={`badge ${
                                report.status === 'pending' ? 'bg-warning' :
                                report.status === 'reviewed_by_prl' ? 'bg-success' :
                                'bg-info'
                              }`}>
                                {report.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Report Details */}
                {selectedReport && (
                  <div className="card p-4 mb-4 border-primary">
                    <h5 className="mb-3">Report Details</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Module:</strong> {selectedReport.module_code} - {selectedReport.module_name}</p>
                        <p><strong>Lecturer:</strong> {selectedReport.lecturer_name}</p>
                        <p><strong>Week:</strong> {selectedReport.week_of_reporting}</p>
                        <p><strong>Date:</strong> {new Date(selectedReport.date_of_lecture).toLocaleDateString()}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Venue:</strong> {selectedReport.venue}</p>
                        <p><strong>Time:</strong> {selectedReport.scheduled_time}</p>
                        <p><strong>Students Present:</strong> {selectedReport.actual_students_present}</p>
                      </div>
                    </div>
                    <hr/>
                    <p><strong>Topic Taught:</strong> {selectedReport.topic_taught}</p>
                    <p><strong>Learning Outcomes:</strong> {selectedReport.learning_outcomes}</p>
                    <p><strong>Lecturer's Recommendations:</strong> {selectedReport.recommendations || "None"}</p>
                    
                    {selectedReport.prl_feedback && (
                      <div className="alert alert-success mt-3">
                        <strong>Your Previous Feedback:</strong><br/>
                        {selectedReport.prl_feedback}
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback Form */}
                <div className="card p-4">
                  <h5>Add PRL Feedback</h5>
                  {!selectedReport ? (
                    <p className="text-muted">Select a report above to add feedback</p>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit}>
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Feedback for: {selectedReport.lecturer_name} - {selectedReport.module_code}</strong>
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Enter your feedback for the lecturer's report..."
                          value={prlFeedback}
                          onChange={(e) => setPrlFeedback(e.target.value)}
                          required
                        />
                      </div>
                      <button className="btn btn-primary">Submit Feedback</button>
                      <button 
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                          setSelectedReport(null);
                          setPrlFeedback("");
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case "monitoring":
        return (
          <div>
            {streamInfo && (
              <div className="alert alert-info mb-4">
                <h5 className="mb-2">Monitoring {streamInfo.stream_name} Stream</h5>
              </div>
            )}

            <h5>Stream Monitoring</h5>
            <div className="alert alert-secondary">
              <p className="mb-0">
                <strong>Note:</strong> Monitoring functionality tracks all activities in your stream including:
              </p>
              <ul className="mb-0 mt-2">
                <li>Lecturer report submissions</li>
                <li>Student attendance trends</li>
                <li>Course performance metrics</li>
              </ul>
            </div>

            <div className="row mt-4">
              <div className="col-md-4">
                <div className="card text-center p-3 bg-light">
                  <h3 className="text-primary">{courses.length}</h3>
                  <p className="mb-0">Total Modules</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center p-3 bg-light">
                  <h3 className="text-success">{lecturers.length}</h3>
                  <p className="mb-0">Lecturers</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center p-3 bg-light">
                  <h3 className="text-warning">{reports.length}</h3>
                  <p className="mb-0">Reports Submitted</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "rating":
        return (
          <div>
            {streamInfo && (
              <div className="alert alert-info mb-4">
                <h5 className="mb-2">Rate Lecturers in {streamInfo.stream_name}</h5>
              </div>
            )}

            <h5>Rate a Lecturer</h5>
            <p className="text-muted">Provide feedback on lecturer performance in your stream</p>

            <form onSubmit={submitLecturerRating} className="card p-4">
              {/* Select Lecturer */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Select Lecturer *</strong>
                </label>
                <select 
                  className="form-control"
                  value={selectedLecturer?.id || ""}
                  onChange={handleLecturerSelect}
                  required
                >
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.first_name} {lecturer.last_name} ({lecturer.email})
                    </option>
                  ))}
                </select>
                {lecturers.length === 0 && (
                  <small className="text-muted">No lecturers in your stream yet</small>
                )}
              </div>

              {/* Rating Score */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Rating (1-5) *</strong>
                </label>
                <select 
                  className="form-control"
                  name="score"
                  value={lecturerRating.score}
                  onChange={handleRatingChange}
                  required
                >
                  <option value="">-- Select Rating --</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              {/* Comments */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Comments/Feedback</strong>
                </label>
                <textarea 
                  className="form-control"
                  name="comments"
                  value={lecturerRating.comments}
                  onChange={handleRatingChange}
                  rows="4"
                  placeholder="Provide detailed feedback about the lecturer's teaching performance..."
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={!selectedLecturer || !lecturerRating.score}
              >
                Submit Rating
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Principal Lecturer (PRL) Dashboard</h1>

      {/* User Info */}
      {user && (
        <div className="alert alert-primary mb-4">
          <strong>Welcome, {user.first_name} {user.last_name}!</strong>
          {streamInfo && (
            <span> - Managing {streamInfo.stream_name} ({streamInfo.stream_code}) Stream</span>
          )}
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        {["courses", "classes", "reports", "monitoring", "rating"].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {renderTabContent()}
    </div>
  );
}