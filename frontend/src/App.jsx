import { Routes, Route } from "react-router-dom";

import Desktop from "./pages/Desktop";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import FinalEvaluated from "./pages/FinalEvaluated";
import WindowFrame from "./components/WindowFrame";

/*
  IMPORTANT: <Sidebar /> is rendered INSIDE each page (Dashboard, FinalEvaluated, etc.)
  because each page owns its own collapsed/expanded state and wires it to the
  top-bar hamburger button. Do NOT render <Sidebar /> here in App.jsx — that would
  create two sidebars stacked on top of each other.
*/

function App() {
  return (
    <Routes>
      {/* Public Page */}
      <Route path="/" element={<Desktop />} />

      {/* Recruiter Pages — wrapped in WindowFrame for desktop-app chrome */}
      <Route path="/dashboard"       element={<WindowFrame><Dashboard /></WindowFrame>} />
      <Route path="/candidates"      element={<WindowFrame><Candidates /></WindowFrame>} />
      <Route path="/interviews"      element={<WindowFrame><Interviews /></WindowFrame>} />
      <Route path="/analytics"       element={<WindowFrame><Analytics /></WindowFrame>} />
      <Route path="/reports"         element={<WindowFrame><Reports /></WindowFrame>} />
      <Route path="/final-evaluated" element={<WindowFrame><FinalEvaluated /></WindowFrame>} />
    </Routes>
  );
}

export default App;