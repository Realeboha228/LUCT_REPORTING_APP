import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// GET LECTURER'S CLASSES
// ========================
export const getLecturerClasses = async () => {
  const res = await axios.get(`${API_URL}/lecturer/classes`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET LECTURER'S REPORTS
// ========================
export const getLecturerReports = async () => {
  const res = await axios.get(`${API_URL}/lecturer/reports`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// SUBMIT LECTURER REPORT
// ========================
export const submitLecturerReport = async (reportData) => {
  const res = await axios.post(`${API_URL}/lecturer/reports`, reportData, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET STUDENTS IN CLASS
// ========================
export const getClassStudents = async (classId) => {
  const res = await axios.get(`${API_URL}/lecturer/classes/${classId}/students`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ADD STUDENT TO CLASS
// ========================
export const addStudentToClass = async (classId, studentId) => {
  const res = await axios.post(
    `${API_URL}/lecturer/classes/${classId}/students`,
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
    `${API_URL}/lecturer/classes/${classId}/students/${studentId}`,
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET LECTURER'S ASSIGNED STREAMS
// ========================
export const getLecturerStreams = async () => {
  const res = await axios.get(`${API_URL}/lecturer/streams`, {
    headers: authHeader()
  });
  return res.data;
};