import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// SUBMIT RATING (Student to Lecturer)
// ========================
export const submitStudentRating = async (lecturerId, score, comments) => {
  const res = await axios.post(
    `${API_URL}/reporting/ratings`,
    {
      ratee_id: lecturerId,
      score: score,
      comments: comments,
      rating_type: "student_to_lecturer"
    },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET STUDENT'S ENROLLED COURSES
// ========================
export const getStudentCourses = async () => {
  const res = await axios.get(`${API_URL}/classes/student-courses`, {
    headers: authHeader()
  });
  return res.data;
};

// Note: This endpoint may need to be created in backend if it doesn't exist
// Alternative: fetch all courses and filter by student enrollment