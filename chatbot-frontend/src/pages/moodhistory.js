import React, { useState, useEffect } from "react";
import api from "../services/api";
import MoodPieChart from "../components/MoodPieChart";
import MoodBarChart from "../components/MoodBarChart";
import MoodStreakTracker from "../components/MoodStreakTracker";
import "../styles/moodhistory.css";

const transformMoodData = (data) => {
  if (data && typeof data === "object" && data.mood_distribution) {
    return Object.entries(data.mood_distribution).map(([mood, value]) => ({
      name: mood,
      value: value,
    }));
  }
  return [];
};

const transformFrequencyData = (data) => {
  if (data && typeof data === "object" && data.mood_frequency) {
    return Object.keys(data.mood_frequency).map((mood) => ({
      mood: mood,
      count: data.mood_frequency[mood],
    }));
  }
  return [];
};

const MoodHistory = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dailyMoodData, setDailyMoodData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyMoodData = async (date) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await api.get(`/api/mood-daily/?date=${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDailyMoodData(transformMoodData(response.data));
    } catch (error) {
      console.error("Error fetching daily mood data:", error);
    }
  };

  const fetchFrequencyData = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await api.get("/api/mood-frequency/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFrequencyData(transformFrequencyData(response.data));
    } catch (error) {
      console.error("Error fetching frequency data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchDailyMoodData(selectedDate);
      await fetchFrequencyData();
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  if (loading) {
    return <p className="mood-loading">Loading mood data...</p>;
  }

  return (
    <div className="mood-history-container">
      <h2 className="mood-history-title">Mood Tracking Dashboard</h2>

      
      <div className="date-picker-container">
        <label htmlFor="date">Select a Date:</label>
        <input
          type="date"
          id="date"
          className="custom-date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      
      <div className="mood-charts-section">
        <div className="mood-chart-box">
          <h3>Daily Mood Distribution</h3>
          <MoodPieChart data={dailyMoodData} />
        </div>

        <div className="mood-chart-box">
          <h3>Weekly Mood Frequency</h3>
          <MoodBarChart data={frequencyData} />
        </div>
      </div>

      
      <div className="mood-streak-section">
        <MoodStreakTracker />
      </div>
    </div>
  );
};

export default MoodHistory;
