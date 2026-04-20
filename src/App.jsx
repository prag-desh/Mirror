import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Vault from "./pages/Vault";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";

function PageTransition({ children }) {
  const location = useLocation();
  
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/results" element={
          <PageTransition>
            <Results />
          </PageTransition>
        } />
        <Route path="/vault" element={
          <PageTransition>
            <Vault />
          </PageTransition>
        } />
        <Route path="/profile" element={
          <PageTransition>
            <Profile />
          </PageTransition>
        } />
      </Routes>
      <BottomNav />
    </div>
  );
}
