import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function PLDashboard() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeTab, setActiveTab] = useState("courses");

  // State for all data
  const [modules, setModules] = useState([]);
  const [streams, setStreams] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [prls, setPrls] = useState([]);
  const [lecturerReports, setLecturerReports] = useState([]);
  const [prlReports, setPrlReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [plFeedback, setPlFeedback] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [allRatings, setAllRatings] = useState([]);

  // Add Course Form
  const [courseForm, setCourseForm] = useState({
    module_name: "",
    module_code: "",
    class_name: "",
    stream_id: "",
    lecturer_id: ""
  });

  // Assign Lecturer Form with stream filter
  const [assignForm, setAssignForm] = useState({
    stream_id: "",
    module_id: "",
    lecturer_id: ""
  });

  // Filtered modules based on selected stream
  const [filteredModules, setFilteredModules] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------
  // Fetch data on mount
  // ------------------------
  useEffect(() => {
    fetchStreams();
    fetchLecturers();
    fetchPRLs();
    fetchModules();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else if (activeTab === "rating") {
      fetchAllRatings();
    }
  }, [activeTab]);

  // Filter modules when stream changes in assign form
  useEffect(() => {
    if (assignForm.stream_id) {
      const filtered = modules.filter(m => m.stream_id === parseInt(assignForm.stream_id));
      setFilteredModules(filtered);
    } else {
      setFilteredModules([]);
    }
  }, [assignForm.stream_id, modules]);

  // ------------------------
  // Fetch Functions
  // ------------------------
  const fetchStreams = async () => {
    try {
      const response = await fetch(`${API_URL}/pl/streams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStreams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching streams:", err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_URL}/pl/lecturers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Lecturers fetched:", data);
      setLecturers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
    }
  };

  const fetchPRLs = async () => {
    try {
      const response = await fetch(`${API_URL}/pl/prls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPrls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching PRLs:", err);
    }
  };

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pl/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("Modules fetched:", data);
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching modules:", err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pl/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Separate reports by source (lecturer vs PRL)
      const fromLecturers = data.filter(r => r.status === 'pending');
      const fromPRLs = data.filter(r => r.status === 'reviewed_by_prl' || r.prl_feedback);
      
      setLecturerReports(fromLecturers);
      setPrlReports(fromPRLs);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setLecturerReports([]);
      setPrlReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/pl/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const fetchAllRatings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pl/all-ratings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAllRatings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching ratings:", err);
      setAllRatings([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Add New Course/Module
  // ------------------------
  const handleCourseFormChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    if (!courseForm.module_name || !courseForm.module_code || !courseForm.stream_id) {
      alert("Module name, code, and stream are required!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/pl/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Course added successfully!");
        setCourseForm({
          module_name: "",
          module_code: "",
          class_name: "",
          stream_id: "",
          lecturer_id: ""
        });
        fetchModules();
        fetchDashboardStats();
      } else {
        alert(data.message || "Failed to add course");
      }
    } catch (err) {
      console.error("Error adding course:", err);
      alert("Error adding course");
    }
  };

  // ------------------------
  // Assign Lecturer to Module
  // ------------------------
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm({ ...assignForm, [name]: value });
    
    // Reset module selection when stream changes
    if (name === 'stream_id') {
      setAssignForm(prev => ({ ...prev, module_id: "" }));
    }
  };

  const handleAssignLecturer = async (e) => {
    e.preventDefault();

    if (!assignForm.module_id || !assignForm.lecturer_id) {
      alert("Please select both module and lecturer!");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/pl/courses/${assignForm.module_id}/assign-lecturer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ lecturer_id: assignForm.lecturer_id })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Lecturer assigned successfully!");
        setAssignForm({ stream_id: "", module_id: "", lecturer_id: "" });
        fetchModules();
      } else {
        alert(data.message || "Failed to assign lecturer");
      }
    } catch (err) {
      console.error("Error assigning lecturer:", err);
      alert("Error assigning lecturer");
    }
  };

  // ------------------------
  // Add PL Feedback to Report
  // ------------------------
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReport) {
      alert("Please select a report!");
      return;
    }

    if (!plFeedback.trim()) {
      alert("Please enter feedback!");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/pl/reports/${selectedReport.id}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ pl_feedback: plFeedback })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Feedback submitted successfully!");
        setPlFeedback("");
        setSelectedReport(null);
        fetchReports();
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Error submitting feedback");
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
            <h5>Courses Management</h5>

            {/* Add New Course Form */}
            <div className="card p-4 mb-4">
              <h6>Add New Course/Module</h6>
              <form onSubmit={handleAddCourse}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Module Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="module_name"
                      value={courseForm.module_name}
                      onChange={handleCourseFormChange}
                      placeholder="e.g., Data Structures and Algorithms"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Module Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="module_code"
                      value={courseForm.module_code}
                      onChange={handleCourseFormChange}
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Class Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="class_name"
                      value={courseForm.class_name}
                      onChange={handleCourseFormChange}
                      placeholder="e.g., CS Year 1"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Stream *</label>
                    <select
                      className="form-control"
                      name="stream_id"
                      value={courseForm.stream_id}
                      onChange={handleCourseFormChange}
                      required
                    >
                      <option value="">-- Select Stream --</option>
                      {streams.map(stream => (
                        <option key={stream.id} value={stream.id}>
                          {stream.stream_name} ({stream.stream_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Assign Lecturer (Optional)</label>
                    <select
                      className="form-control"
                      name="lecturer_id"
                      value={courseForm.lecturer_id}
                      onChange={handleCourseFormChange}
                    >
                      <option value="">-- Select Lecturer --</option>
                      {lecturers.map(lec => (
                        <option key={lec.id} value={lec.id}>
                          {lec.first_name} {lec.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Course
                </button>
              </form>
            </div>

            {/* Assign Lecturer to Existing Course */}
            <div className="card p-4 mb-4">
              <h6>Assign Lecturer to Existing Module</h6>
              <form onSubmit={handleAssignLecturer}>
                <div className="row">
                  {/* STEP 1: Select Stream First */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">1. Select Stream *</label>
                    <select
                      className="form-control"
                      name="stream_id"
                      value={assignForm.stream_id}
                      onChange={handleAssignFormChange}
                      required
                    >
                      <option value="">-- Select Stream --</option>
                      {streams.map(stream => (
                        <option key={stream.id} value={stream.id}>
                          {stream.stream_name} ({stream.stream_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STEP 2: Select Module from filtered list */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">2. Select Module *</label>
                    <select
                      className="form-control"
                      name="module_id"
                      value={assignForm.module_id}
                      onChange={handleAssignFormChange}
                      required
                      disabled={!assignForm.stream_id}
                    >
                      <option value="">-- Select Module --</option>
                      {filteredModules.map(mod => (
                        <option key={mod.id} value={mod.id}>
                          {mod.module_code} - {mod.module_name}
                        </option>
                      ))}
                    </select>
                    {!assignForm.stream_id && (
                      <small className="text-muted">Select a stream first</small>
                    )}
                    {assignForm.stream_id && filteredModules.length === 0 && (
                      <small className="text-warning">No modules in this stream</small>
                    )}
                  </div>

                  {/* STEP 3: Select Lecturer */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">3. Select Lecturer *</label>
                    <select
                      className="form-control"
                      name="lecturer_id"
                      value={assignForm.lecturer_id}
                      onChange={handleAssignFormChange}
                      required
                    >
                      <option value="">-- Select Lecturer --</option>
                      {lecturers.map(lec => (
                        <option key={lec.id} value={lec.id}>
                          {lec.first_name} {lec.last_name} ({lec.email})
                        </option>
                      ))}
                    </select>
                    {lecturers.length === 0 && (
                      <small className="text-warning">No lecturers available</small>
                    )}
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={!assignForm.stream_id || !assignForm.module_id || !assignForm.lecturer_id}
                >
                  Assign Lecturer
                </button>
              </form>
            </div>

            {/* All Courses Table */}
            <h6>All Courses/Modules</h6>
            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : modules.length === 0 ? (
              <div className="alert alert-info">No modules found</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Stream</th>
                      <th>Code</th>
                      <th>Module Name</th>
                      <th>Class</th>
                      <th>Lecturer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => (
                      <tr key={mod.id}>
                        <td>
                          <span className="badge bg-primary">
                            {mod.stream_code}
                          </span>
                        </td>
                        <td><strong>{mod.module_code}</strong></td>
                        <td>{mod.module_name}</td>
                        <td>{mod.class_name || "N/A"}</td>
                        <td>
                          {mod.lecturer_name || (
                            <span className="text-danger">Not Assigned</span>
                          )}
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
            <h5>Reports Management</h5>
            <p className="text-muted">View reports from lecturers and PRLs, provide feedback</p>

            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Reports from Lecturers */}
                <div className="card p-3 mb-4">
                  <h6 className="text-primary">Reports from Lecturers (Pending PRL Review)</h6>
                  {lecturerReports.length === 0 ? (
                    <div className="alert alert-info">No pending reports from lecturers</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Stream</th>
                            <th>Module</th>
                            <th>Lecturer</th>
                            <th>Week</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lecturerReports.map(report => (
                            <tr key={report.id}>
                              <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                              <td><span className="badge bg-primary">{report.stream_code}</span></td>
                              <td><strong>{report.module_code}</strong></td>
                              <td>{report.lecturer_name}</td>
                              <td>Week {report.week_of_reporting}</td>
                              <td><span className="badge bg-warning">Pending</span></td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-info"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Reports from PRLs */}
                <div className="card p-3 mb-4">
                  <h6 className="text-success">Reports from PRLs (Reviewed)</h6>
                  {prlReports.length === 0 ? (
                    <div className="alert alert-info">No reviewed reports from PRLs yet</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Stream</th>
                            <th>Module</th>
                            <th>Lecturer</th>
                            <th>PRL</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prlReports.map(report => (
                            <tr key={report.id}>
                              <td>{new Date(report.date_of_lecture).toLocaleDateString()}</td>
                              <td><span className="badge bg-primary">{report.stream_code}</span></td>
                              <td><strong>{report.module_code}</strong></td>
                              <td>{report.lecturer_name}</td>
                              <td>{report.prl_name || "N/A"}</td>
                              <td><span className="badge bg-success">Reviewed by PRL</span></td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-info"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Selected Report Details */}
                {selectedReport && (
                  <div className="card p-4 mb-4 border-primary">
                    <h5>Report Details</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Module:</strong> {selectedReport.module_code} - {selectedReport.module_name}</p>
                        <p><strong>Lecturer:</strong> {selectedReport.lecturer_name}</p>
                        <p><strong>Week:</strong> {selectedReport.week_of_reporting}</p>
                        <p><strong>Date:</strong> {new Date(selectedReport.date_of_lecture).toLocaleDateString()}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Stream:</strong> {selectedReport.stream_name}</p>
                        <p><strong>PRL:</strong> {selectedReport.prl_name || "Not assigned"}</p>
                        <p><strong>Venue:</strong> {selectedReport.venue}</p>
                        <p><strong>Students:</strong> {selectedReport.actual_students_present}</p>
                      </div>
                    </div>
                    <hr/>
                    <p><strong>Topic:</strong> {selectedReport.topic_taught}</p>
                    <p><strong>Learning Outcomes:</strong> {selectedReport.learning_outcomes}</p>
                    
                    {selectedReport.prl_feedback && (
                      <div className="alert alert-info">
                        <strong>PRL Feedback:</strong><br/>
                        {selectedReport.prl_feedback}
                      </div>
                    )}

                    {selectedReport.pl_feedback && (
                      <div className="alert alert-success">
                        <strong>Your Previous Feedback:</strong><br/>
                        {selectedReport.pl_feedback}
                      </div>
                    )}
                  </div>
                )}

                {/* PL Feedback Form */}
                <div className="card p-4">
                  <h5>Add PL Feedback</h5>
                  {!selectedReport ? (
                    <p className="text-muted">Select a report above to add feedback</p>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit}>
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Final Feedback as Program Leader</strong>
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Provide your feedback on this report..."
                          value={plFeedback}
                          onChange={(e) => setPlFeedback(e.target.value)}
                          required
                        />
                      </div>
                      <button className="btn btn-primary">Submit Feedback</button>
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                          setSelectedReport(null);
                          setPlFeedback("");
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
            <h5>System Monitoring</h5>
            <p className="text-muted">Overview of lecturers and system metrics</p>

            {dashboardStats ? (
              <>
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card text-center p-3 bg-primary text-white">
                      <h2>{dashboardStats.streams}</h2>
                      <p className="mb-0">Streams</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center p-3 bg-success text-white">
                      <h2>{dashboardStats.modules || dashboardStats.courses}</h2>
                      <p className="mb-0">Modules</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center p-3 bg-info text-white">
                      <h2>{dashboardStats.lecturers}</h2>
                      <p className="mb-0">Lecturers</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center p-3 bg-warning text-white">
                      <h2>{dashboardStats.students}</h2>
                      <p className="mb-0">Students</p>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="card text-center p-3">
                      <h3 className="text-secondary">{dashboardStats.prls}</h3>
                      <p className="mb-0">Principal Lecturers</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card text-center p-3">
                      <h3 className="text-primary">{dashboardStats.total_reports}</h3>
                      <p className="mb-0">Total Reports</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card text-center p-3">
                      <h3 className="text-danger">{dashboardStats.pending_reports}</h3>
                      <p className="mb-0">Pending Reports</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        );

      case "lecturers":
        return (
          <div>
            <h5>All Lecturers</h5>
            <p className="text-muted">View all lecturers across all streams</p>

            {lecturers.length === 0 ? (
              <div className="alert alert-info">No lecturers found</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Primary Stream</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturers.map(lec => (
                      <tr key={lec.id}>
                        <td>{lec.first_name} {lec.last_name}</td>
                        <td>{lec.email}</td>
                        <td>
                          {lec.stream_name ? (
                            <span className="badge bg-primary">{lec.stream_name}</span>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "rating":
        return (
          <div>
            <h5>View All Ratings Across Streams</h5>
            <p className="text-muted">
              As Program Leader, you can view all ratings made across the faculty. 
              You do not rate anyone - you oversee the rating system.
            </p>

            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : allRatings.length === 0 ? (
              <div className="alert alert-info">No ratings have been submitted yet</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Rater</th>
                      <th>Ratee</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRatings.map(rating => (
                      <tr key={rating.id}>
                        <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                        <td>{rating.rater_name}</td>
                        <td>{rating.ratee_name}</td>
                        <td>
                          <span className={`badge ${
                            rating.rating_type === 'student_to_lecturer' ? 'bg-info' :
                            rating.rating_type === 'lecturer_to_prl' ? 'bg-warning' :
                            rating.rating_type === 'prl_to_lecturer' ? 'bg-success' :
                            'bg-secondary'
                          }`}>
                            {rating.rating_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <strong>{rating.score}/5</strong>
                        </td>
                        <td>{rating.comments || <em className="text-muted">No comments</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="alert alert-secondary mt-4">
              <strong>Note:</strong> As Program Leader, you oversee the entire rating system across all streams. 
              This view helps you monitor feedback quality and identify any issues in the faculty.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Program Leader (PL) Dashboard</h1>

      {user && (
        <div className="alert alert-success mb-4">
          <strong>Welcome, {user.first_name} {user.last_name}!</strong> - Overseeing FICT Streams
        </div>
      )}

      <ul className="nav nav-tabs mb-4">
        {["courses", "reports", "monitoring", "lecturers", "rating"].map(tab => (
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