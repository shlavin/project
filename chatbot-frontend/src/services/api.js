import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; 


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");  
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Authorization header attached:", config.headers["Authorization"]);
    } else {
      console.warn("No access token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          
          window.location.href = "/login";
          return Promise.reject(error);
        }

        
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.status === 200) {
          
          localStorage.setItem("access_token", response.data.access);

          
          originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;

          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
