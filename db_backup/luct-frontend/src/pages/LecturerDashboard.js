import React, { useState, useEffect } from "react";

export default function LecturerDashboard() {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("classes");

  // Classes + Students
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [newStudentId, setNewStudentId] = useState("");

  // Reports
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({
    week: "",
    lectureDate: "",
    topic: "",
    learningOutcomes: "",
    recommendations: "",
    actualStudents: ""
  });

  // Ratings
  const [ratingForm, setRatingForm] = useState({ rating: 0, feedback: "" });

  // Monitoring
  const [monitoringData, setMonitoringData] = useState([]);

  // ------------------------
  // Fetch lecturer classes
  // ------------------------
  useEffect(() => {
    fetch("http://localhost:5000/api/lecturer/classes", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error(err));
  }, []);

  // ------------------------
  // Fetch students of a selected class
  // ------------------------
  useEffect(() => {
    if (!selectedClass) return;
    fetchClassStudents();
  }, [selectedClass]);

  const fetchClassStudents = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${selectedClass.id}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClassStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addStudent = async () => {
    if (!newStudentId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${selectedClass.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: newStudentId })
      });
      const data = await res.json();
      if (res.ok) {
        setNewStudentId("");
        fetchClassStudents();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const removeStudent = async (studentId) => {
    try {
      await fetch(`http://localhost:5000/api/classes/${selectedClass.id}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClassStudents();
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------
  // Report submission
  // ------------------------

  

  const handleReportChange = (e) => setReportForm({ ...reportForm, [e.target.name]: e.target.value });

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...reportForm, class_id: selectedClass.id })
      });
      if (res.ok) {
        alert("Report submitted");
        setReportForm({ week: "", lectureDate: "", topic: "", learningOutcomes: "", recommendations: "", actualStudents: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------
  // Ratings submission
  // ------------------------
  const handleRatingChange = (e) => setRatingForm({ ...ratingForm, [e.target.name]: e.target.value });

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${selectedClass.id}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(ratingForm)
      });
      if (res.ok) {
        alert("Rating submitted");
        setRatingForm({ rating: 0, feedback: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------------
  // Monitoring fetch (automatic)
  // ------------------------
  const fetchMonitoringData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/lecturer/monitoring`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMonitoringData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "monitoring") fetchMonitoringData();
  }, [activeTab]);

  // ------------------------
  // Render Tab Content
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
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id}>
                    <td>{cls.course_name}</td>
                    <td>{cls.course_code}</td>
                    <td>{cls.class_name}</td>
                    <td>{cls.venue}</td>
                    <td>{cls.scheduled_time}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => setSelectedClass(cls)}>Manage Students</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedClass && (
              <div className="mt-4">
                <h6>Manage Students in {selectedClass.class_name}</h6>
                <div className="mb-3 d-flex">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Student ID"
                    value={newStudentId}
                    onChange={e => setNewStudentId(e.target.value)}
                  />
                  <button className="btn btn-success" onClick={addStudent}>Add Student</button>
                </div>
                <ul className="list-group">
                  {classStudents.map(s => (
                    <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {s.name} ({s.student_id})
                      <button className="btn btn-sm btn-danger" onClick={() => removeStudent(s.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case "reports":
        return (
          <div>
            <h5>Submit Class Report</h5>
            {/* Report form here */}
          </div>
        );

      case "monitoring":
        return (
          <div>
            <h5>Monitoring (Attendance & Feedback)</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {monitoringData.map(m => (
                  <tr key={m.id}>
                    <td>{m.class_name}</td>
                    <td>{m.student_name}</td>
                    <td>{m.attendance}</td>
                    <td>{m.feedback}</td>
                    <td>{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "ratings":
        return (
          <div>
            <h5>Rate Your Class Performance</h5>
            <form onSubmit={submitRating}>
              <div className="mb-3">
                <label>Rating (1-5)</label>
                <input type="number" min="1" max="5" className="form-control" name="rating" value={ratingForm.rating} onChange={handleRatingChange} required/>
              </div>
              <div className="mb-3">
                <label>Feedback</label>
                <textarea className="form-control" name="feedback" value={ratingForm.feedback} onChange={handleRatingChange}></textarea>
              </div>
              <button className="btn btn-primary">Submit Rating</button>
            </form>
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
            <button className={`nav-link ${activeTab===tab?"active":""}`} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>
      {renderTabContent()}
    </div>
  );
}
