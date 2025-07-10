// import axios from "axios";

// export const API_URL = "http://localhost:4000/api";

// export function getToken() {
//   return localStorage.getItem("token");
// }
// export function setToken(token) {
//   localStorage.setItem("token", token);
// }
// export function removeToken() {
//   localStorage.removeItem("token");
// }

// export const api = axios.create({ baseURL: API_URL });
// api.interceptors.request.use((config) => {
//   const token = getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
