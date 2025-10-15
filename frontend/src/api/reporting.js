import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`
});

// ========================
// SUBMIT RATING
// ========================
export const submitRating = async (rateeId, score, comments, ratingType) => {
  const res = await axios.post(
    `${API_URL}/reporting/ratings`,
    {
      ratee_id: rateeId,
      score: score,
      comments: comments,
      rating_type: ratingType || "student_to_lecturer"
    },
    { headers: authHeader() }
  );
  return res.data;
};

// ========================
// GET RATINGS FOR A USER
// ========================
export const getUserRatings = async (userId) => {
  const res = await axios.get(`${API_URL}/reporting/ratings/${userId}`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET MY RATINGS (ratings I've given)
// ========================
export const getMyRatings = async () => {
  const res = await axios.get(`${API_URL}/reporting/my-ratings`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET REPORT BY ID
// ========================
export const getReportById = async (reportId) => {
  const res = await axios.get(`${API_URL}/reporting/reports/${reportId}`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET RECENT ACTIVITY (MONITORING)
// ========================
export const getRecentActivity = async () => {
  const res = await axios.get(`${API_URL}/reporting/monitoring/recent`, {
    headers: authHeader()
  });
  return res.data;
};

// ========================
// GET STATISTICS BY STREAM (MONITORING)
// ========================
export const getStreamStatistics = async () => {
  const res = await axios.get(`${API_URL}/reporting/monitoring/streams`, {
    headers: authHeader()
  });
  return res.data;
};