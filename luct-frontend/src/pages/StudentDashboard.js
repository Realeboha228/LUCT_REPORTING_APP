import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";


function StudentDashboard() {
  const [rating, setRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
  console.log("Submitted Lecturer:", lecturer);
  console.log("Ratings:", ratings);
  alert("Feedback submitted successfully!");
    e.preventDefault();
    alert("Monitoring submitted & rating: " + rating);
    // Later: send with axios.post("/api/student/rating")
  };

  // Lecturer name
const [lecturer, setLecturer] = useState("");

// Ratings object (default empty)
const [ratings, setRatings] = useState({
  teachingAids: "",
  communication: "",
  punctuality: "",
  fairness: "",
  criticalThinking: ""
});

// Handle rating change
const handleRatingChange = (key, value) => {
  setRatings((prev) => ({
    ...prev,
    [key]: value
  }));
};




  return (
    <div className="container mt-4">
      <h2>Student Dashboard</h2>

      {/* Monitoring Section */}
      <div className="card p-3 mb-3">
        <h4>Class Monitoring</h4>
        <form onSubmit={handleSubmit}>
          <input placeholder="Course Code" className="form-control mb-2" />
          <input placeholder="Lecture Date" type="date" className="form-control mb-2" />
          <button className="btn btn-success">Mark Attendance</button>
        </form>
      </div>

     {/* === Rate Lecturer Section === */}
<Card className="mt-4">
  <Card.Body>
    <h3>Rate Your Lecturer</h3>
    <Form onSubmit={handleSubmit}>
      {/* Lecturer Name */}
      <Form.Group className="mb-3">
        <Form.Label>Lecturer Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter lecturer's name"
          value={lecturer}
          onChange={(e) => setLecturer(e.target.value)}
          required
        />
      </Form.Group>

      {/* Helper function to render rating options */}
      {[
        { key: "teachingAids", label: "Teaching Aids" },
        { key: "communication", label: "Communication" },
        { key: "punctuality", label: "Punctuality" },
        { key: "fairness", label: "Fairness in Grading" },
        { key: "criticalThinking", label: "Assignments Encouraged Critical Thinking" },
      ].map((item) => (
        <div className="mb-3 p-2 border rounded" key={item.key}>
          <h5>{item.label}</h5>
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

      <Button variant="primary" type="submit">
        Submit Feedback
      </Button>
    </Form>
  </Card.Body>
</Card>
       
      </div>
  );
}

export default StudentDashboard;
