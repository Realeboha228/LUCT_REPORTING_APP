import React, { useState, useEffect } from "react";
import "./LecturerDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function LecturerDashboard() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("classes");

  // Lecturer's streams and modules
  const [lecturerStreams, setLecturerStreams] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  
  // Students management
  const [moduleStudents, setModuleStudents] = useState([]);
  const [newStudentId, setNewStudentId] = useState("");

  // Report form
  const [reportForm, setReportForm] = useState({
    stream_id: "",
    module_id: "",
    week_of_reporting: "",
    date_of_lecture: "",
    actual_students_present: "",
    venue: "",
    scheduled_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: ""
  });
  
  const [selectedStreamModules, setSelectedStreamModules] = useState([]);
  const [selectedModuleData, setSelectedModuleData] = useState(null);

  // Reports list
  const [myReports, setMyReports] = useState([]);

  // Monitoring
  const [monitoringData, setMonitoringData] = useState([]);

  // Rating PRL
  const [prls, setPrls] = useState([]);
  const [selectedPRL, setSelectedPRL] = useState(null);
  const [prlRating, setPrlRating] = useState({
    score: "",
    comments: ""
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------
  // Fetch lecturer's data
  // ------------------------
  useEffect(() => {
    fetchLecturerStreams();
    fetchLecturerModules();
    fetchMyReports();
    fetchPRLs();
  }, []);

  const fetchLecturerStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/lecturer/streams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setLecturerStreams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching streams:", err);
      setLecturerStreams([]);
    }
  };

  const fetchLecturerModules = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/lecturer/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load modules. Please try again.");
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReports = async () => {
    try {
      const response = await fetch(`${API_URL}/lecturer/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMyReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setMyReports([]);
    }
  };

  const fetchPRLs = async () => {
    try {
      const response = await fetch(`${API_URL}/lecturer/prls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPrls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching PRLs:", err);
      setPrls([]);
    }
  };

  // ------------------------
  // Handle stream selection in report form
  // ------------------------
  const handleStreamChange = (e) => {
    const streamId = e.target.value;
    setReportForm({ ...reportForm, stream_id: streamId, module_id: "" });
    
    // Filter modules by selected stream
    const filteredModules = modules.filter(m => m.stream_id === parseInt(streamId));
    setSelectedStreamModules(filteredModules);
    setSelectedModuleData(null);
  };

  // ------------------------
  // Handle module selection in report form
  // ------------------------
  const handleModuleChange = (e) => {
    const moduleId = e.target.value;
    setReportForm({ ...reportForm, module_id: moduleId });
    
    // Get selected module data to auto-fill course code
    const module = selectedStreamModules.find(m => m.id === parseInt(moduleId));
    setSelectedModuleData(module);
  };

  // ------------------------
  // Fetch students of selected module
  // ------------------------
  const fetchModuleStudents = async (moduleId) => {
    try {
      const res = await fetch(`${API_URL}/lecturer/modules/${moduleId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setModuleStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setModuleStudents([]);
    }
  };

  const addStudent = async () => {
    if (!newStudentId || !selectedModule) return;
    try {
      const res = await fetch(`${API_URL}/classes/${selectedModule.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: newStudentId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Student added successfully!");
        setNewStudentId("");
        fetchModuleStudents(selectedModule.id);
      } else {
        alert(data.message || "Failed to add student");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };

  const removeStudent = async (studentId) => {
    if (!selectedModule) return;
    try {
      await fetch(`${API_URL}/classes/${selectedModule.id}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Student removed successfully!");
      fetchModuleStudents(selectedModule.id);
    } catch (err) {
      console.error(err);
      alert("Error removing student");
    }
  };

  // ------------------------
  // Report submission
  // ------------------------
  const handleReportChange = (e) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const submitReport = async (e) => {
    e.preventDefault();
    
    if (!reportForm.stream_id || !reportForm.module_id) {
      alert("Please select both stream and module");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lecturer/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(reportForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Report submitted successfully to your PRL!");
        // Reset form
        setReportForm({
          stream_id: "",
          module_id: "",
          week_of_reporting: "",
          date_of_lecture: "",
          actual_students_present: "",
          venue: "",
          scheduled_time: "",
          topic_taught: "",
          learning_outcomes: "",
          recommendations: ""
        });
        setSelectedStreamModules([]);
        setSelectedModuleData(null);
        fetchMyReports();
      } else {
        alert(data.message || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting report");
    }
  };

  // ------------------------
  // Monitoring fetch
  // ------------------------
  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/lecturer/monitoring`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMonitoringData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMonitoringData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "monitoring") fetchMonitoringData();
  }, [activeTab]);

  // ------------------------
  // PRL Rating Submission
  // ------------------------
  const handlePRLSelect = (e) => {
    const prlId = parseInt(e.target.value);
    const prl = prls.find(p => p.id === prlId);
    setSelectedPRL(prl);
  };

  const handleRatingChange = (e) => {
    setPrlRating({ ...prlRating, [e.target.name]: e.target.value });
  };

  const submitPRLRating = async (e) => {
    e.preventDefault();

    if (!selectedPRL) {
      alert("Please select a PRL");
      return;
    }

    if (!prlRating.score) {
      alert("Please provide a rating score");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/lecturer/rate-prl`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prl_id: selectedPRL.id,
          score: prlRating.score,
          comments: prlRating.comments
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Rating submitted successfully to Program Leader!");
        setSelectedPRL(null);
        setPrlRating({ score: "", comments: "" });
      } else {
        alert(data.message || "Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    }
  };

  // ------------------------
  // Render Tab Content
  // ------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "classes":
        return (
          <div>
            <h5>Your Assigned Modules & Streams</h5>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : modules.length === 0 ? (
              <div className="alert alert-info">
                No modules assigned yet.
              </div>
            ) : (
              <>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Stream</th>
                      <th>Module Code</th>
                      <th>Module Name</th>
                      <th>Class</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => (
                      <tr key={mod.id}>
                        <td>
                          <span className="badge bg-primary">
                            {mod.stream_code || mod.stream_name}
                          </span>
                        </td>
                        <td><strong>{mod.module_code}</strong></td>
                        <td>{mod.module_name}</td>
                        <td>{mod.class_name}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => {
                              setSelectedModule(mod);
                              fetchModuleStudents(mod.id);
                            }}
                          >
                            Manage Students
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {selectedModule && (
                  <div className="card mt-4 p-4">
                    <h6>Manage Students in {selectedModule.module_name} ({selectedModule.class_name})</h6>
                    <div className="mb-3 d-flex">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Enter Student ID (e.g., STD001)"
                        value={newStudentId}
                        onChange={e => setNewStudentId(e.target.value)}
                      />
                      <button className="btn btn-success" onClick={addStudent}>
                        Add Student
                      </button>
                    </div>
                    
                    {moduleStudents.length === 0 ? (
                      <div className="alert alert-info">No students enrolled yet.</div>
                    ) : (
                      <ul className="list-group">
                        {moduleStudents.map(s => (
                          <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              {s.first_name} {s.last_name} 
                              <span className="badge bg-secondary ms-2">{s.student_id}</span>
                            </span>
                            <button 
                              className="btn btn-sm btn-danger" 
                              onClick={() => removeStudent(s.id)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "reports":
        return (
          <div>
            <h5>Submit Class Report to PRL</h5>
            
            <form onSubmit={submitReport} className="card p-4 mb-4">
              <div className="row">
                {/* Faculty/Stream Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Faculty/Stream Name *</strong>
                  </label>
                  <select 
                    className="form-control" 
                    name="stream_id"
                    value={reportForm.stream_id}
                    onChange={handleStreamChange}
                    required
                  >
                    <option value="">-- Select Stream --</option>
                    {lecturerStreams.map(stream => (
                      <option key={stream.id} value={stream.id}>
                        {stream.stream_name} ({stream.stream_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Name - Auto populated based on module */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Class Name</strong>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedModuleData?.class_name || ""}
                    disabled
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </div>
              </div>

              <div className="row">
                {/* Week of Reporting */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Week of Reporting *</strong>
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="week_of_reporting"
                    value={reportForm.week_of_reporting}
                    onChange={handleReportChange}
                    min="1"
                    max="52"
                    placeholder="e.g., 12"
                    required
                  />
                </div>

                {/* Date of Lecture */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Date of Lecture *</strong>
                  </label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="date_of_lecture"
                    value={reportForm.date_of_lecture}
                    onChange={handleReportChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                {/* Course/Module Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Course/Module Name *</strong>
                  </label>
                  <select 
                    className="form-control" 
                    name="module_id"
                    value={reportForm.module_id}
                    onChange={handleModuleChange}
                    required
                    disabled={!reportForm.stream_id}
                  >
                    <option value="">-- Select Module --</option>
                    {selectedStreamModules.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.module_name}
                      </option>
                    ))}
                  </select>
                  {!reportForm.stream_id && (
                    <small className="text-muted">Select a stream first</small>
                  )}
                </div>

                {/* Course Code - Auto filled */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    <strong>Course Code</strong>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedModuleData?.module_code || ""}
                    disabled
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </div>
              </div>

              <div className="row">
                {/* Lecturer Name - Auto filled */}
                <div className="col-md-12 mb-3">
                  <label className="form-label">
                    <strong>Lecturer's Name</strong>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={`${user.first_name} ${user.last_name}`}
                    disabled
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                </div>
              </div>

              <div className="row">
                {/* Actual Number of Students Present */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <strong>Actual Students Present *</strong>
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="actual_students_present"
                    value={reportForm.actual_students_present}
                    onChange={handleReportChange}
                    min="0"
                    placeholder="e.g., 45"
                    required
                  />
                </div>

                {/* Venue */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <strong>Venue of the Class *</strong>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="venue"
                    value={reportForm.venue}
                    onChange={handleReportChange}
                    placeholder="e.g., Room 101"
                    required
                  />
                </div>

                {/* Scheduled Lecture Time */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    <strong>Scheduled Lecture Time *</strong>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="scheduled_time"
                    value={reportForm.scheduled_time}
                    onChange={handleReportChange}
                    placeholder="e.g., 09:00 - 11:00"
                    required
                  />
                </div>
              </div>

              {/* Topic Taught */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Topic Taught *</strong>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="topic_taught"
                  value={reportForm.topic_taught}
                  onChange={handleReportChange}
                  placeholder="e.g., Introduction to Arrays and Loops"
                  required
                />
              </div>

              {/* Learning Outcomes */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Learning Outcomes of the Topic *</strong>
                </label>
                <textarea 
                  className="form-control" 
                  name="learning_outcomes"
                  value={reportForm.learning_outcomes}
                  onChange={handleReportChange}
                  rows="3"
                  placeholder="What students should have learned from this lecture..."
                  required
                />
              </div>

              {/* Lecturer's Recommendations */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Lecturer's Recommendations</strong>
                </label>
                <textarea 
                  className="form-control" 
                  name="recommendations"
                  value={reportForm.recommendations}
                  onChange={handleReportChange}
                  rows="3"
                  placeholder="Any recommendations, observations, or concerns..."
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                Submit Report to PRL
              </button>
            </form>

            {/* My Submitted Reports */}
            <h5 className="mt-5">My Submitted Reports</h5>
            {myReports.length === 0 ? (
              <div className="alert alert-info">No reports submitted yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Stream</th>
                      <th>Module</th>
                      <th>Week</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>PRL Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.map(report => (
                      <tr key={report.id}>
                        <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                        <td>
                          <span className="badge bg-primary">
                            {report.stream_code}
                          </span>
                        </td>
                        <td>{report.module_code}</td>
                        <td>Week {report.week_of_reporting}</td>
                        <td>{report.topic_taught}</td>
                        <td>
                          <span className={`badge ${
                            report.status === 'pending' ? 'bg-warning' :
                            report.status === 'reviewed_by_prl' ? 'bg-info' :
                            'bg-success'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          {report.prl_feedback || 
                            <em className="text-muted">Awaiting feedback</em>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "monitoring":
        return (
          <div>
            <h5>Student Attendance Monitoring</h5>
            <p className="text-muted">View attendance records marked by students in your modules</p>
            
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : monitoringData.length === 0 ? (
              <div className="alert alert-info">
                No attendance data available yet. Students will mark attendance for your modules.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Lecture Date</th>
                      <th>Status</th>
                      <th>Marked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitoringData.map(record => (
                      <tr key={record.id}>
                        <td>
                          <strong>{record.module_code}</strong><br/>
                          <small className="text-muted">{record.module_name}</small>
                        </td>
                        <td>{record.student_name}</td>
                        <td>
                          <span className="badge bg-secondary">{record.student_id}</span>
                        </td>
                        <td>{new Date(record.lecture_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'present' ? 'bg-success' : 
                            record.status === 'late' ? 'bg-warning' : 
                            'bg-danger'
                          }`}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <small>{new Date(record.marked_at).toLocaleString()}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "ratings":
        return (
          <div>
            <h5>Rate Your Principal Lecturer (PRL)</h5>
            <p className="text-muted">
              Rate the PRL of the stream you teach in. Your rating will be sent to the Program Leader.
            </p>
            
            <form onSubmit={submitPRLRating} className="card p-4">
              {/* Select PRL */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Select Principal Lecturer (PRL) *</strong>
                </label>
                <select 
                  className="form-control"
                  value={selectedPRL?.id || ""}
                  onChange={handlePRLSelect}
                  required
                >
                  <option value="">-- Select PRL --</option>
                  {prls.map(prl => (
                    <option key={prl.id} value={prl.id}>
                      {prl.prl_name} - {prl.stream_code} Stream
                    </option>
                  ))}
                </select>
                {prls.length === 0 && (
                  <small className="text-muted">No PRLs available in your streams</small>
                )}
              </div>

              {/* Display Selected PRL Info */}
              {selectedPRL && (
                <div className="alert alert-info mb-3">
                  <strong>Selected PRL:</strong> {selectedPRL.prl_name}<br/>
                  <strong>Stream:</strong> {selectedPRL.stream_name} ({selectedPRL.stream_code})<br/>
                  <strong>Email:</strong> {selectedPRL.email}
                </div>
              )}

              {/* Rating Score */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Rating (1-5) *</strong>
                </label>
                <select 
                  className="form-control"
                  name="score"
                  value={prlRating.score}
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
                  value={prlRating.comments}
                  onChange={handleRatingChange}
                  rows="4"
                  placeholder="Provide detailed feedback about the PRL's performance, leadership, support, etc..."
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={!selectedPRL || !prlRating.score}
              >
                Submit Rating to Program Leader
              </button>
            </form>

            <div className="alert alert-warning mt-4">
              <strong>Note:</strong> Your rating will be sent directly to the Program Leader (PL) who oversees all streams. 
              This helps maintain quality and accountability across the university.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Lecturer Dashboard</h1>
      
      <ul className="nav nav-tabs mb-4">
        {["classes", "reports", "monitoring", "ratings"].map(tab => (
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