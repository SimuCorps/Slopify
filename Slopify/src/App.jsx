import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import "./styles/global.css";

export default function App() {
  return (
    <div className="app" style={{ backgroundColor: "var(--bg-dark)" }}>
      <main>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </Router>
      </main>
      <footer>
        <p>Powered by Gruvbox</p>
      </footer>
    </div>
  );
}
