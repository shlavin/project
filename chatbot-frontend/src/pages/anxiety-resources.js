import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/anxiety-resources.css";

const AnxietyResources = () => {
  const navigate = useNavigate();

  const resources = [
    {
      title: "Breathing Exercises",
      description: "Practice deep breathing techniques to help calm anxiety and reduce stress.",
      link: "https://www.healthline.com/health/breathing-exercise"
    },
    {
      title: "Guided Meditation",
      description: "Listen to guided meditation sessions for relaxation and mindfulness.",
      link: "https://www.headspace.com/meditation/guided-meditation"
    },
    {
      title: "Mental Health Helplines",
      description: "Access a list of mental health helplines and support networks.",
      link: "https://www.mentalhealth.gov/get-help/immediate-help"
    },
    {
      title: "Self-Care Tips",
      description: "Learn simple and effective self-care strategies to manage anxiety.",
      link: "https://www.psychologytoday.com/us/basics/self-care"
    }
  ];

  return (
    <div className="anxiety-resources-container">
      <h1 className="page-title">Anxiety Resources</h1>
      <p className="intro-text">Find helpful tools and techniques to manage anxiety and improve your well-being.</p>
      
      <div className="resources-list">
        {resources.map((resource, index) => (
          <div key={index} className="resource-card">
            <h2>{resource.title}</h2>
            <p>{resource.description}</p>
            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
              Learn More
            </a>
          </div>
        ))}
      </div>
      
      
      <div className="school-details">
        <h2>University Counseling Services</h2>
        <p><strong>Institution:</strong> Chuka University</p>
        <p><strong>Location:</strong> Main Campus, Student Wellness Center</p>
        <p><strong>Contact:</strong> +254 123 456 789</p>
        <p><strong>Email:</strong> counseling@chuka.ac.ke</p>
        <p><strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM</p>
      </div>

      <button className="back-button" onClick={() => navigate("/homepage")}>Back to Homepage</button>
    </div>
  );
};

export default AnxietyResources;
