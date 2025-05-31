import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPasswordRequestPage = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setToken("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/password-reset/request/", {
        name,
      });

      if (response.data.reset_token) {
        setToken(response.data.reset_token);
        setMessage("Token generated successfully. Use it on the next page to reset your password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request password reset.");
    }
  };

  const handleRedirect = () => {
    navigate("/resetpassword", { state: { token } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {message && <p className="text-green-500">{message}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {token && (
          <div className="bg-gray-100 text-sm text-gray-700 p-2 rounded mb-3">
            <strong>Your Token:</strong><br />
            <code>{token}</code>
            <button
              onClick={handleRedirect}
              className="mt-3 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
              Continue to Reset Password
            </button>
          </div>
        )}
        <form onSubmit={handleRequest} className="flex flex-col">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mb-3 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Generate Reset Token
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordRequestPage;
