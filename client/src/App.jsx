import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/AuthStore";
import "./App.css";

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen min-w-screen bg-gray-900">
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center h-screen text-white text-3xl font-bold">
                Welcome to Hackathon
              </div>
            }
          />
          {!user && <Route path="*" element={<Navigate to="/" replace />} />}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
