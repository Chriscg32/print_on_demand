import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DesignSelector from './components/DesignSelector';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="app-container">
        <Routes>
          <Route path="/designs" element={<DesignSelector />} />
          {/* Add other routes */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;