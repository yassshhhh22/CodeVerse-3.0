import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import HistoricalAnalysisPage from "./pages/HistoricalAnalysisPage";
import UserManagementPage from "./pages/UserManagementPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/analytics" element={<HistoricalAnalysisPage />} />
        <Route path="/users" element={<UserManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
