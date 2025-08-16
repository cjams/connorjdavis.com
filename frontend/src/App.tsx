import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
