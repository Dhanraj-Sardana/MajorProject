import React, { useState } from 'react';
import StarterGUI from './components/StarterGUI';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Conflict from './components/Conflictfile.jsx';
import Remote from './components/Remote.jsx';
function App() {
  return(
    <Router>
    <Routes>
      <Route path="/" element={<StarterGUI />} />
      <Route path="/conflict" element={<Conflict />} />
      <Route path='/remote' element={<Remote/>}/>
    </Routes>
  </Router>
  )
    
}

export default App;
