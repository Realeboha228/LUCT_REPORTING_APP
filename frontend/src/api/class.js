import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// GET STUDENTS IN A CLASS
// ========================
export const getClassStudents = async (classId) => {
  const res = await axios.get(`${API_URL}/classes/${classId}/students`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ADD STUDENT TO CLASS
// ========================
export const addStudentToClass = async (classId, studentId) => {
  const res = await axios.post(
    `${API_URL}/classes/${classId}/students`,
    { student_id: studentId },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// REMOVE STUDENT FROM CLASS
// ========================
export const removeStudentFromClass = async (classId, studentId) => {
  const res = await axios.delete(
    `${API_URL}/classes/${classId}/students/${studentId}`,
    { headers: authHeader() }
  );
  return res.data;
};