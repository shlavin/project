import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/moodBoosters.css";

const MoodBoosters = () => {
  const navigate = useNavigate();

  const boosters = [
    {
      title: "Listen to Music",
      description: "Music can instantly lift your mood and help reduce stress."
    },
    {
      title: "Go for a Walk",
      description: "A short walk outside can refresh your mind and boost energy levels."
    },
    {
      title: "Practice Gratitude",
      description: "Take a moment to write down things you're grateful for to shift your perspective."
    },
    {
      title: "Watch Something Funny",
      description: "Laughter is a great way to relieve stress and improve your mood."
    },
    {
      title: "Try Deep Breathing",
      description: "Breathing exercises can help you feel more relaxed and centered."
    }
  ];

  return (
    <div className="mood-boosters-container">
      <h1 className="page-title">Mood Boosters</h1>
      <p className="intro-text">Simple actions you can take to uplift your mood and feel better.</p>
      
      <div className="boosters-list">
        {boosters.map((booster, index) => (
          <div key={index} className="booster-card">
            <h2>{booster.title}</h2>
            <p>{booster.description}</p>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={() => navigate("/homepage")}>Back to Homepage</button>
    </div>
  );
};

export default MoodBoosters;
