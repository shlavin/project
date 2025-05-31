import React, { useEffect, useState } from "react";
import axios from "axios";
import './MoodStreakTracker.css';

const MoodStreakTracker = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://127.0.0.1:8000/api/mood-streak/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStreakData(response.data);
    } catch (error) {
      console.error("Error fetching mood streak:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  if (loading) return <p>Loading mood streak...</p>;

  return (
    <div className="streak-container">
      <h3>Mood Streak</h3>
      {streakData ? (
        <div className={`streak-box ${streakData.mood}`}>
          <p className="streak-message">{streakData.message}</p>
        </div>
      ) : (
        <p>No streak data available.</p>
      )}
    </div>
  );
};

export default MoodStreakTracker;
