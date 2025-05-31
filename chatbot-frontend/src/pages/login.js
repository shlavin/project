import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const logoutMessage = location.state?.logoutMessage;

  
  useEffect(() => {
    if (logoutMessage) {
      window.history.replaceState({}, document.title);
    }
  }, [logoutMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        name,
        password,
      });

      if (response.status === 200) {
        setMessage("Login successful! Redirecting...");

        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("userToken", response.data.access);
        localStorage.setItem("username", name);

        navigate("/homepage");
      }
    } catch (err) {
      if (!err.response) {
        setError("🚨 Server is unreachable. Please check your connection.");
      } else {
        setError(err.response.data.message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {logoutMessage && <p className="text-green-500">{logoutMessage}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-green-500">{message}</p>}

        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-3 rounded"
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 mb-3 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm mt-3 text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500">
            Register here
          </Link>
        </p>
        <p className="text-sm mt-1 text-gray-600">
          Forgot your password?{" "}
          <Link to="/forgot-password" className="text-blue-500">
            Reset here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
