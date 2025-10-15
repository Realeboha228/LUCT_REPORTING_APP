import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ========================
// REGISTER
// ========================
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

// ========================
// LOGIN
// ========================
export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

// ========================
// GET ALL STREAMS (for dropdown)
// ========================
export const getStreams = async () => {
  const res = await axios.get(`${API_URL}/auth/streams`);
  return res.data;
};