import React, { useState } from 'react';
import StarterGUI from './components/StarterGUI';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Conflict from './components/Conflictfile.jsx';

function App() {
  return(
    <Router>
    <Routes>
      <Route path="/" element={<StarterGUI />} />
      <Route path="/conflict" element={<Conflict />} />
    </Routes>
  </Router>
  )
    
}

export default App;
