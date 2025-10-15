import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// GET ALL COURSES IN PRL'S STREAM
// ========================
export const getPRLCourses = async () => {
  const res = await axios.get(`${API_URL}/prl/courses`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET ALL REPORTS IN PRL'S STREAM
// ========================
export const getPRLReports = async () => {
  const res = await axios.get(`${API_URL}/prl/reports`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ADD FEEDBACK TO REPORT (PRL)
// ========================
export const addPRLFeedback = async (reportId, prlFeedback) => {
  const res = await axios.put(
    `${API_URL}/prl/reports/${reportId}/feedback`,
    { prl_feedback: prlFeedback },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET ALL LECTURERS IN PRL'S STREAM
// ========================
export const getPRLLecturers = async () => {
  const res = await axios.get(`${API_URL}/prl/lecturers`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET PRL'S STREAM INFO
// ========================
export const getPRLStreamInfo = async () => {
  const res = await axios.get(`${API_URL}/prl/stream`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// RATE A LECTURER (PRL to Lecturer)
// ========================
export const rateLecturer = async (lecturerId, score, comments) => {
  const res = await axios.post(
    `${API_URL}/prl/rate-lecturer`,
    {
      lecturer_id: lecturerId,
      score: score,
      comments: comments
    },
    { headers: authHeader() }
  );
  return res.data;
};