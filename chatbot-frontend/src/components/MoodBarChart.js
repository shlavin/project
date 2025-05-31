import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";


const moodColors = {
  happiness: "#FFD700",
  joy: "#FF8C00",
  neutral: "#A9A9A9",
  sadness: "#1E90FF",
  anger: "#DC143C",
  fear: "#8B0000",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", padding: "5px", borderRadius: "5px", boxShadow: "0px 2px 5px rgba(0,0,0,0.2)" }}>
        <p>{`${payload[0].payload.mood}`}</p>
        <p>{`Count: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const MoodBarChart = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("BarChart data is not an array or empty:", data);
    return <p>No frequency data available</p>;
  }

  console.log("Final BarChart Data:", data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mood" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={moodColors[entry.mood] || "#8884d8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MoodBarChart;
