import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API,
  // jangan set Content-Type di sini — biarkan browser menetapkan boundary untuk multipart/form-data
  // headers: { "Content-Type": "application/json" }, // <-- hapus/komentari
});

// otomatis token jika disimpan di localStorage
const token = localStorage.getItem("mk_token");
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export default api;