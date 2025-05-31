import React, { useState } from "react";  
import { useNavigate, Link } from "react-router-dom"; 
import api from "../services/api";         
import "../styles/register.css";

const Register = () => {
  const [name, setName] = useState(""); 
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); 

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/register/", {
        name,         
        password,
        email,
      });

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000); 

      setName("");  
      setPassword("");
      setEmail("");
    } catch (error) {
     
      console.error("Error details:", error.response?.data || error.message);

      if (error.response) {
        setMessage(error.response.data.error || "Registration failed. Please try again.");
      } else {
        setMessage("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
      <p className="text-sm mt-3 text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-500">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
