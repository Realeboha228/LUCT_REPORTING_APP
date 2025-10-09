import React, { useState, useEffect } from "react";

export default function PRLDashboard({ prlId }) {
  const [activeTab, setActiveTab] = useState("courses");
  const [feedback, setFeedback] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // -------------------------
  // Manual data
  // -------------------------
  const [courses] = useState([
    { id: 1, code: "CSE101", name: "Introduction to Programming", lecturer: "Dr. John Doe" },
    { id: 2, code: "BIT201", name: "Database Systems", lecturer: "Prof. Jane Smith" },
    { id: 3, code: "IT301", name: "Network Security", lecturer: "Dr. Alan Turing" },
    { id: 4, code: "CSE102", name: "Data Structures", lecturer: "Dr. Grace Hopper" }
  ]);

  const [classes] = useState([
    { id: 1, course_name: "Introduction to Programming", class_name: "BSCITY2", venue: "Room 101", scheduled_time: "09:00 - 11:00", total_registered: 60 },
    { id: 2, course_name: "Database Systems", class_name: "BSCBIT", venue: "Room 201", scheduled_time: "14:00 - 16:00", total_registered: 50 },
    { id: 3, course_name: "Network Security", class_name: "BSCIT", venue: "Room 102", scheduled_time: "08:00 - 10:00", total_registered: 45 }
  ]);

  const [reports, setReports] = useState([
    {
      id: 1,
      faculty: "Computer Science",
      className: "BSCITY2",
      week: 1,
      lectureDate: "2025-10-01",
      courseName: "Introduction to Programming",
      courseCode: "CSE101",
      lecturerName: "Dr. John Doe",
      actualStudents: 58,
      totalStudents: 60,
      venue: "Room 101",
      scheduledTime: "09:00 - 11:00",
      topic: "Variables and Data Types",
      learningOutcomes: "Understand basic data types in JS",
      recommendations: "Provide more examples next time"
    }
  ]);

  const [monitoringData] = useState([
    { id: 1, course: "CSE101", className: "BSCITY2", date: "2025-10-01", status: "On Track", notes: "Attendance good" },
    { id: 2, course: "BIT201", className: "BSCBIT", date: "2025-10-02", status: "Needs Attention", notes: "Some students missing" }
  ]);

  const [ratingsData] = useState([
    { id: 1, course: "CSE101", lecturer: "Dr. John Doe", rating: 4.5, feedback: "Clear explanation" },
    { id: 2, course: "IT301", lecturer: "Dr. Alan Turing", rating: 4.2, feedback: "Good interaction" }
  ]);

  // -------------------------
  // Feedback form handler
  // -------------------------
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!selectedReport) return alert("Select a report first!");

    const newFeedback = { ...selectedReport, feedback };
    alert("Feedback submitted successfully!");
    setFeedback("");
    setSelectedReport(null);

    // Optionally, you could store feedback somewhere
  };

  // -------------------------
  // Render tab content
  // -------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "courses":
        return (
          <div className="card p-3">
            <h4>Courses Under Your Stream</h4>
            <ul>
              {courses.map((c) => (
                <li key={c.id}>
                  {c.code} - {c.name} ({c.lecturer})
                </li>
              ))}
            </ul>
          </div>
        );

      case "classes":
        return (
          <div>
            <h4>Your Classes</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Class</th>
                  <th>Venue</th>
                  <th>Time</th>
                  <th>Total Registered</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.course_name}</td>
                    <td>{cls.class_name}</td>
                    <td>{cls.venue}</td>
                    <td>{cls.scheduled_time}</td>
                    <td>{cls.total_registered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "reports":
        return (
          <>
            <div className="card p-3 mb-3">
              <h4>View Reports</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Topic</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: selectedReport?.id === r.id ? "#eef" : "",
                      }}
                    >
                      <td>{r.faculty}</td>
                      <td>{r.className}</td>
                      <td>{r.courseName}</td>
                      <td>{r.lectureDate}</td>
                      <td>{r.topic}</td>
                      <td>
                        {r.actualStudents}/{r.totalStudents}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-3">
              <h4>Add Feedback</h4>
              <form onSubmit={handleFeedbackSubmit}>
                <textarea
                  className="form-control mb-2"
                  placeholder="Enter feedback for lecturer..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />
                <button className="btn btn-warning">Submit Feedback</button>
              </form>
            </div>
          </>
        );

      case "monitoring":
        return (
          <div>
            <h4>Monitoring Overview</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {monitoringData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.course}</td>
                    <td>{item.className}</td>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                    <td>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "rating":
        return (
          <div>
            <h4>Lecturer Ratings</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Lecturer</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {ratingsData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.course}</td>
                    <td>{item.lecturer}</td>
                    <td>{item.rating}</td>
                    <td>{item.feedback}</td>
                  </tr>
                ))}
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
      <h2 className="mb-4">Principal Lecturer (PRL) Dashboard</h2>

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
