// PLDashboard.jsx (Manual Data Version)

import React, { useState } from "react";

export default function PLDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState("");

  // -------------------------
  // Manual data
  // -------------------------
  const [lecturers] = useState([
    { id: 1, name: "Dr. John Doe", email: "john@example.com" },
    { id: 2, name: "Prof. Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Dr. Alan Turing", email: "alan@example.com" }
  ]);

  const [courses, setCourses] = useState([
    { id: 1, name: "Introduction to Programming", code: "CSE101", lecturer_id: 1 },
    { id: 2, name: "Database Systems", code: "BIT201", lecturer_id: 2 },
    { id: 3, name: "Network Security", code: "IT301", lecturer_id: 3 }
  ]);

  const [classes] = useState([
    { id: 1, course_name: "Introduction to Programming", course_code: "CSE101", lecturer_name: "Dr. John Doe" },
    { id: 2, course_name: "Database Systems", course_code: "BIT201", lecturer_name: "Prof. Jane Smith" },
    { id: 3, course_name: "Network Security", course_code: "IT301", lecturer_name: "Dr. Alan Turing" }
  ]);

  const [prlReports] = useState([
    {
      id: 1,
      prl_name: "Prof. PRL One",
      course_name: "Introduction to Programming",
      course_code: "CSE101",
      date_of_lecture: "2025-10-01",
      topic_taught: "Variables and Data Types",
      actual_students: 58,
      total_students: 60,
      venue: "Room 101",
      lecturer_recommendations: "Provide more examples"
    },
    {
      id: 2,
      prl_name: "Prof. PRL Two",
      course_name: "Database Systems",
      course_code: "BIT201",
      date_of_lecture: "2025-10-02",
      topic_taught: "Normalization",
      actual_students: 50,
      total_students: 55,
      venue: "Lab 1",
      lecturer_recommendations: "Focus on practice exercises"
    }
  ]);

  const [ratings] = useState([
    { id: 1, course: "CSE101", lecturer: "Dr. John Doe", rating: 4.5, feedback: "Excellent teaching" },
    { id: 2, course: "BIT201", lecturer: "Prof. Jane Smith", rating: 4.2, feedback: "Good interaction" }
  ]);

  const [monitoring] = useState([
    { id: 1, course: "CSE101", class_name: "BSCITY2", date: "2025-10-01", status: "On Track", notes: "Attendance good" },
    { id: 2, course: "BIT201", class_name: "BSCBIT", date: "2025-10-02", status: "Needs Attention", notes: "Some students absent" }
  ]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Fill in course details");

    const newCourse = {
      id: courses.length + 1,
      name: selectedCourse.name,
      code: selectedCourse.code,
      lecturer_id: selectedCourse.lecturer_id
    };
    setCourses([...courses, newCourse]);
    setSelectedCourse({ name: "", code: "", lecturer_id: "" });
    alert("Course added successfully!");
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback) return alert("Enter feedback first");
    alert("Feedback submitted!");
    setFeedback("");
  };

  // -------------------------
  // Render tab content
  // -------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div>
            <h4>Add New Course</h4>
            <form onSubmit={handleAddCourse} className="border p-3 rounded mb-4">
              <div className="mb-3">
                <label>Course Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedCourse?.name || ""}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Course Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedCourse?.code || ""}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, code: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label>Assign Lecturer</label>
                <select
                  className="form-control"
                  value={selectedCourse?.lecturer_id || ""}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, lecturer_id: e.target.value })}
                  required
                >
                  <option value="">-- Select Lecturer --</option>
                  {lecturers.map((lec) => (
                    <option key={lec.id} value={lec.id}>
                      {lec.name} ({lec.email})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary">Add Course</button>
            </form>

            <h5>All Courses</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Lecturer</th>
                </tr>
              </thead>
              <tbody>
                {courses.length ? courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.code}</td>
                    <td>{lecturers.find((l) => l.id === c.lecturer_id)?.name || "Unassigned"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-center">No courses available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "reports":
        return (
          <div>
            <h4>PRL Reports</h4>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>PRL</th><th>Course</th><th>Date</th><th>Topic</th><th>Students</th><th>Venue</th><th>Recommendations</th>
                </tr>
              </thead>
              <tbody>
                {prlReports.length ? prlReports.map(rpt => (
                  <tr key={rpt.id}>
                    <td>{rpt.prl_name}</td>
                    <td>{rpt.course_name} ({rpt.course_code})</td>
                    <td>{rpt.date_of_lecture}</td>
                    <td>{rpt.topic_taught}</td>
                    <td>{rpt.actual_students}/{rpt.total_students}</td>
                    <td>{rpt.venue}</td>
                    <td>{rpt.lecturer_recommendations}</td>
                  </tr>
                )) : <tr><td colSpan="7" className="text-center">No PRL reports</td></tr>}
              </tbody>
            </table>

            <div className="card p-3 mt-4">
              <h5>Add Feedback</h5>
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  className="form-control mb-2"
                  placeholder="Enter feedback..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
                <button className="btn btn-warning">Submit Feedback</button>
              </form>
            </div>
          </div>
        );

      case "classes":
        return (
          <div>
            <h4>Classes</h4>
            <table className="table table-striped">
              <thead>
                <tr><th>Course</th><th>Lecturer</th><th>Code</th></tr>
              </thead>
              <tbody>
                {classes.length ? classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.course_name}</td>
                    <td>{cls.lecturer_name}</td>
                    <td>{cls.course_code}</td>
                  </tr>
                )) : <tr><td colSpan="3" className="text-center">No classes scheduled</td></tr>}
              </tbody>
            </table>
          </div>
        );

      case "ratings":
        return (
          <div>
            <h4>Ratings</h4>
            <table className="table table-striped">
              <thead>
                <tr><th>Course</th><th>Lecturer</th><th>Rating</th><th>Feedback</th></tr>
              </thead>
              <tbody>
                {ratings.length ? ratings.map((r) => (
                  <tr key={r.id}>
                    <td>{r.course}</td>
                    <td>{r.lecturer}</td>
                    <td>{r.rating}</td>
                    <td>{r.feedback}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="text-center">No ratings available</td></tr>}
              </tbody>
            </table>
          </div>
        );

      case "monitoring":
        return (
          <div>
            <h4>Monitoring</h4>
            <table className="table table-striped">
              <thead>
                <tr><th>Course</th><th>Class</th><th>Date</th><th>Status</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {monitoring.length ? monitoring.map((m) => (
                  <tr key={m.id}>
                    <td>{m.course}</td>
                    <td>{m.class_name}</td>
                    <td>{m.date}</td>
                    <td>{m.status}</td>
                    <td>{m.notes}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center">No monitoring data</td></tr>}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Program Leader Dashboard</h2>
      <ul className="nav nav-tabs mb-4">
        {["courses","reports","classes","ratings","monitoring"].map(tab => (
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
