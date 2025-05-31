import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/conversations.css";

const ConversationHistory = () => {
  const [conversationGroups, setConversationGroups] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("friend");

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUserName(storedName);

    const fetchConversations = async () => {
      try {
        const response = await api.get("/api/conversations/");
        const enhanced = response.data.map((group) => ({
          ...group,
          conversations: group.conversations.map((conv) => {
            const title = conv.messages?.[0]?.text || "Conversation";
            return {
              ...conv,
              title: title.slice(0, 40) + (title.length > 40 ? "..." : ""),
            };
          }),
        }));
        setConversationGroups(enhanced);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}/`);
      setMessages(response.data.messages);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <div className="conversation-page">
  <h2 className="page-title">🗨️ Conversation History</h2>

  <div className="conversation-container">
   
    <div className="conversation-panel">
      <h3>📅 Conversations</h3>
      {conversationGroups.length > 0 ? (
        conversationGroups.map((group) => (
          <div key={group.date} className="conversation-group">
            <h4>{formatDate(group.date)}</h4>
            <ul className="conversation-list">
              {group.conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className={`conversation-item ${
                    selectedConversation === conversation.id ? "selected" : ""
                  }`}
                  onClick={() => fetchMessages(conversation.id)}
                >
                  <strong>{conversation.title}</strong>
                  <br />
                  <span>{new Date(conversation.created_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>No conversations found.</p>
      )}
    </div>

   
    <div className={`message-panel ${!selectedConversation ? "full-width" : ""}`}>
      {selectedConversation ? (
        <>
          <h3>💬 Messages</h3>
          <ul className="message-list">
            {messages.map((msg, index) => (
              <li key={index} className="message-item">
                <span className="sender">{msg.sender === "bot" ? "Rafiki" : userName}:</span>
                <span className="message-text">{msg.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="empty-state">Select a conversation from the list to view messages.</p>
      )}
    </div>
  </div>
</div>

  );
};

export default ConversationHistory;
