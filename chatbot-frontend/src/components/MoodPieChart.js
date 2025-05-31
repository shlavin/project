import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB", "#AA00FF", "#FF007F"
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", padding: "5px", borderRadius: "5px", boxShadow: "0px 2px 5px rgba(0,0,0,0.2)" }}>
        <p>{`${payload[0].name}`}</p>
        <p>{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const MoodPieChart = ({ data }) => {
  console.log("Received Data for PieChart:", data);
  if (!Array.isArray(data) || data.length === 0) {
    console.error("PieChart data is empty or not an array:", data);
    return <p>No mood data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label={(entry) => `${entry.name} (${entry.value})`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MoodPieChart;
