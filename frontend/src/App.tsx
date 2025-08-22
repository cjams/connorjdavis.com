import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TypographyProvider } from "./contexts/TypographyContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <TypographyProvider>
        <Router>
          <div className="App">
            <div className="bg-background-50 min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/posts/:slug" element={<PostPage />} />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </div>
        </Router>
      </TypographyProvider>
    </ThemeProvider>
  );
}

export default App;
