import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Chatbot from "./components/chatbot";
import Homepage from "./pages/homepage";
import AnxietyResources from "./pages/anxiety-resources";
import MoodBoosters from "./pages/moodBoosters";
import Conversations from "./pages/Conversations";
import MoodHistory from "./pages/moodhistory";
import ResetPassword from "./pages/resetPassword";
import ForgotPasswordRequestPage from "./pages/ForgotPasswordRequestPage";
import ConversationHistory from "./pages/Conversations"; 
import RafikiChat from "./components/chatbot"; 


const isAuthenticated = () => {
  return localStorage.getItem("userToken") !== null;
};


const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => {
      setAuth(isAuthenticated());
    };
    
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <Router>
      <Routes>
       
        <Route path="/" element={auth ? <Navigate to="/homepage" /> : <Navigate to="/login" />} />

        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homepage"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/anxiety-resources"
          element={
            <ProtectedRoute>
              <AnxietyResources />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/moodBoosters"
          element={
            <ProtectedRoute>
              <MoodBoosters />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/moodhistory"
          element={
            <ProtectedRoute>
              <MoodHistory />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
<Route path="/forgot-password" element={<ForgotPasswordRequestPage />} />
<Route path="/resetPassword" element={<ResetPassword />} />
<Route path="/chatbot" element={<RafikiChat />} />
<Route path="/conversations" element={<ConversationHistory />} />
        
        <Route path="*" element={<Navigate to={auth ? "/homepage" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
