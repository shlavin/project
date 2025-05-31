import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/resetPassword.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(location.state?.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetComplete, setResetComplete] = useState(false); 

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/password-reset/confirm/", {
        token,
        new_password: newPassword,
      });

      if (response.status === 200) {
        setMessage("🎉 Password reset successful! Redirecting to login...");
        setResetComplete(true); 
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        setNewPassword("");
        setToken(""); 
      }
    } catch (err) {
      setError(err.response?.data?.message || " Password reset failed.");
    }
  };

  if (!token && !resetComplete) {
    return (
      <div className="text-center mt-10 text-red-600">
         No token provided. Please go to the{" "}
        <a href="/forgot-password" className="text-blue-500 underline">Forgot Password</a> page first.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleReset} className="flex flex-col">
          <input
            type="text"
            placeholder="Enter Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="border p-2 mb-3 rounded"
            required
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 mb-3 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
