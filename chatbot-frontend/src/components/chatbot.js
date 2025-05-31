import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/chatbot.css";
import api from "../services/api";

const RafikiChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const chatEndRef = useRef(null);
  const navigate = useNavigate(); 
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUserName(storedName);
      setMessages([
        {
          text: `Hello ${storedName}, I'm Rafiki! How can I help you today?`,
          sender: "bot",
        },
      ]);
    } else {
      setUserName("friend");
      setMessages([
        {
          text: `Hello friend, I'm Rafiki! How can I help you today?`,
          sender: "bot",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { typing: true, sender: "bot" }]);

    try {
      const response = await api.post("/chatbot-response/", {
        message: input,
        user: userName,
      });

      const botReply = response.data.reply;

      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => !msg.typing));
        setMessages((prev) => [...prev, { text: botReply, sender: "bot" }]);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Rafiki Error:", error.response?.data || error.message);
      setMessages((prev) => prev.filter((msg) => !msg.typing));
      setMessages((prev) => [
        ...prev,
        {
          text: "Oops! Rafiki encountered an error. Please try again later.",
          sender: "bot",
        },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="rafiki-chat-container">
      <div className="rafiki-chat-box">
        <div className="rafiki-chat-header">
          <h2>Rafiki</h2>
          <p>Your Friendly Chatbot</p>

         
          <div className="dropdown">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="dropdown-toggle">
              ☰ Menu
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => navigate("/conversations")}>📜 Conversation History</button>
              </div>
            )}
          </div>
        </div>

        <div className="rafiki-chat-messages">
          {messages.map((msg, index) =>
            msg.typing ? (
              <div key={index} className="rafiki-typing-indicator">
                <span></span> <span></span> <span></span>
              </div>
            ) : (
              <div key={index} className={`rafiki-message ${msg.sender}`}>
                {msg.text}
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="rafiki-input-container">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default RafikiChat;
