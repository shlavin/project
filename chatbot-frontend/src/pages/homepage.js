import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import axios from "axios"; 
import "../styles/homepage.css";

const quotes = [
  "Taking small steps towards self-care can lead to big changes in how we feel. You are stronger than you think.",
  "Believe in yourself and your ability to succeed.",
  "Every day is a new beginning. Take a deep breath and start again.",
  "Self-care is not selfish. You cannot pour from an empty cup.",
  "Your mental health is just as important as your physical health. Take care of it."
];

const getQuoteOfTheDay = () => {
  const dayIndex = new Date().getDate() % quotes.length;
  return quotes[dayIndex];
};

const Homepage = () => {
  const navigate = useNavigate();  
  const [username, setUsername] = useState("Guest");
  const [quote, setQuote] = useState(getQuoteOfTheDay());
  const [joke, setJoke] = useState("Why did the computer go to therapy? Because it had too many bytes of emotional baggage!");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const fetchJoke = async () => {
    try {
      const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
      setJoke(`${response.data.setup} ${response.data.punchline}`);
    } catch (error) {
      console.error("Error fetching joke:", error);
      setJoke("Oops! Couldn't fetch a joke. Try again.");
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("userToken");
    const refreshToken = localStorage.getItem("refreshToken"); 
  
    try {
      await axios.post("http://127.0.0.1:8000/api/logout/", {
        refresh: refreshToken,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error logging out:", error.response?.data || error.message);
    }
  
    
    localStorage.removeItem("userToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    navigate("/login", { state: { logoutMessage: " Successfully logged out." } });
  };
  

  return (
    <div className="homepage-container">
      
      <div className="header">
        <div className="user-greeting">
          <h1>Hi {username} 👋</h1>
        </div>
      </div>

      
      <div className="quote-section">
        <h2>QUOTE OF THE DAY</h2>
        <p>{quote}</p>
      </div>

      
      <div className="fun-section">
        <h3>{joke}</h3>
        <button className="joke-button" onClick={fetchJoke}>Tell me a joke</button>
      </div>

      
      <div className="navigation-buttons">
        <button 
          className="chat-now-button"
          onClick={() => navigate('/chatbot')}  
        >
          CHAT NOW
        </button>
        <button className="anxiety-resources-button" onClick={() => navigate('/anxiety-resources')}>
          ANXIETY RESOURCES
        </button>
        <button className="mood-boosters-button" onClick={() => navigate('/moodBoosters')}>
          MOOD BOOSTERS
        </button>
        <button className="mood-tracking-button" onClick={() => navigate('/moodhistory')}>
  MOOD TRACKING
</button>
      </div>

      
      <div className="logout-container">
        <button onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
};

export default Homepage;
