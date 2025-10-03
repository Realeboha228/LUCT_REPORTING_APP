import React, { useState, useEffect } from "react";

export default function LecturerDashboard() {
  const [activeTab, setActiveTab] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    faculty: "",
    className: "",
    week: "",
    lectureDate: "",
    courseName: "",
    courseCode: "",
    lecturerName: "",
    actualStudents: "",
    totalStudents: "",
    venue: "",
    scheduledTime: "",
    topic: "",
    learningOutcomes: "",
    recommendations: ""
  });

  // Token not needed for manual data
  // const token = localStorage.getItem("token");

  // ------------------------
  // Manually define classes
  // ------------------------
  useEffect(() => {
    const manualClasses = [
      { id: 1, course_name: "Course 1", course_code: "CSE101", class_name: "BSCITY2", venue: "Room 101", scheduled_time: "09:00 - 11:00", total_registered: 60 },
      { id: 2, course_name: "Course 2", course_code: "CSE102", class_name: "BSCITY2", venue: "Lab 1", scheduled_time: "11:00 - 13:00", total_registered: 55 },
      { id: 3, course_name: "Course 3", course_code: "BIT201", class_name: "BSCBIT", venue: "Room 201", scheduled_time: "14:00 - 16:00", total_registered: 50 },
      { id: 4, course_name: "Course 4", course_code: "IT301", class_name: "BSCIT", venue: "Room 102", scheduled_time: "08:00 - 10:00", total_registered: 45 }
    ];
    setClasses(manualClasses);
  }, []);

  // ------------------------
  // Handle report form
  // ------------------------
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add report manually to the reports array
    const newReport = { ...formData, id: reports.length + 1 };
    setReports([...reports, newReport]);
    alert("Report submitted!");
    // Clear form
    setFormData({
      faculty: "",
      className: "",
      week: "",
      lectureDate: "",
      courseName: "",
      courseCode: "",
      lecturerName: "",
      actualStudents: "",
      totalStudents: "",
      venue: "",
      scheduledTime: "",
      topic: "",
      learningOutcomes: "",
      recommendations: ""
    });
  };

  // ------------------------
  // Manual Monitoring and Ratings
  // ------------------------
  const [monitoringData] = useState([
    { id: 1, course: "CSE101", className: "BSCITY2", date: "2025-10-01", status: "On Track", notes: "All students attending" },
    { id: 2, course: "BIT201", className: "BSCBIT", date: "2025-10-02", status: "Needs Attention", notes: "Low attendance" }
  ]);

  const [ratingsData] = useState([
    { id: 1, course: "CSE101", lecturer: "Dr. John Doe", rating: 4.5, feedback: "Clear explanations" },
    { id: 2, course: "IT301", lecturer: "Prof. Jane Smith", rating: 4.2, feedback: "Good interaction with students" }
  ]);

  // ------------------------
  // Render tab content
  // ------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "classes":
        return (
          <div>
            <h5>Your Classes</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
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
                    <td>{cls.course_code}</td>
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
          <div>
            <h5>Submit Class Report</h5>
            <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
              {[
                { label: "Faculty Name", name: "faculty", type: "text" },
                { label: "Class Name", name: "className", type: "text" },
                { label: "Week of Reporting", name: "week", type: "number" },
                { label: "Date of Lecture", name: "lectureDate", type: "date" },
                { label: "Course Name", name: "courseName", type: "text" },
                { label: "Course Code", name: "courseCode", type: "text" },
                { label: "Lecturer’s Name", name: "lecturerName", type: "text" },
                { label: "Actual Number of Students Present", name: "actualStudents", type: "number" },
                { label: "Total Number of Registered Students", name: "totalStudents", type: "number" },
                { label: "Venue of the Class", name: "venue", type: "text" },
                { label: "Scheduled Lecture Time", name: "scheduledTime", type: "text" },
                { label: "Topic Taught", name: "topic", type: "text" }
              ].map((field) => (
                <div className="mb-3" key={field.name}>
                  <label className="form-label">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    className="form-control"
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label">Learning Outcomes of the Topic</label>
                <textarea
                  name="learningOutcomes"
                  className="form-control"
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Lecturer’s Recommendations</label>
                <textarea
                  name="recommendations"
                  className="form-control"
                  value={formData.recommendations}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary">Submit Report</button>
            </form>

            <h5 className="mt-5">Previous Reports</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Students</th>
                  <th>Venue</th>
                  <th>Recommendations</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rpt) => (
                  <tr key={rpt.id}>
                    <td>{rpt.courseName} ({rpt.courseCode})</td>
                    <td>{rpt.lectureDate}</td>
                    <td>{rpt.topic}</td>
                    <td>{rpt.actualStudents}/{rpt.totalStudents}</td>
                    <td>{rpt.venue}</td>
                    <td>{rpt.recommendations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "monitoring":
        return (
          <div>
            <h5>Monitoring Overview</h5>
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
            <h5>Lecturer Ratings</h5>
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
      <h1 className="text-center mb-4">Lecturer Dashboard</h1>
      <ul className="nav nav-tabs mb-4">
        {["classes","reports","monitoring","rating"].map((tab) => (
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
