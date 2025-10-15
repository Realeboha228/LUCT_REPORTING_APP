import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// GET ALL COURSES (ALL STREAMS)
// ========================
export const getPLCourses = async () => {
  const res = await axios.get(`${API_URL}/pl/courses`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ADD NEW COURSE/MODULE
// ========================
export const addNewCourse = async (courseData) => {
  const res = await axios.post(`${API_URL}/pl/courses`, courseData, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ASSIGN LECTURER TO COURSE
// ========================
export const assignLecturerToCourse = async (courseId, lecturerId) => {
  const res = await axios.put(
    `${API_URL}/pl/courses/${courseId}/assign-lecturer`,
    { lecturer_id: lecturerId },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET ALL REPORTS (ALL STREAMS)
// ========================
export const getPLReports = async () => {
  const res = await axios.get(`${API_URL}/pl/reports`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// ADD PL FEEDBACK TO REPORT
// ========================
export const addPLFeedback = async (reportId, plFeedback) => {
  const res = await axios.put(
    `${API_URL}/pl/reports/${reportId}/feedback`,
    { pl_feedback: plFeedback },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET ALL LECTURERS
// ========================
export const getPLLecturers = async () => {
  const res = await axios.get(`${API_URL}/pl/lecturers`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET ALL PRLs
// ========================
export const getPRLs = async () => {
  const res = await axios.get(`${API_URL}/pl/prls`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET ALL STREAMS
// ========================
export const getPLStreams = async () => {
  const res = await axios.get(`${API_URL}/pl/streams`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET DASHBOARD STATS
// ========================
export const getPLDashboard = async () => {
  const res = await axios.get(`${API_URL}/pl/dashboard`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// RATE A PRL (PL to PRL)
// ========================
export const ratePRL = async (prlId, score, comments) => {
  const res = await axios.post(
    `${API_URL}/pl/rate-prl`,
    {
      prl_id: prlId,
      score: score,
      comments: comments
    },
    { headers: authHeader() }
  );
  return res.data;
};