import VerifyAuth from "./pages/auth";
import LoginPage from "./pages/login"
import ShortenPage from "./pages/shorten";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={< LoginPage/>} />
        <Route path="/auth/verify" element={<VerifyAuth />} />
        <Route path="/shorten" element={<ShortenPage />} />
      </Routes>
    </Router>
  );
}

export default App
