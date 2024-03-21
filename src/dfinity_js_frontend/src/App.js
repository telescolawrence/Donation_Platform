import React, { useEffect, useCallback, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Donation from "./pages/Donation";
import Donor from "./pages/Donor";


const App = function AppWrapper() {
 

  return (
    <Router>
    <Routes>
      <Route path="/" element={<Donation />} />
      <Route path="/donor" element={<Donor />} />
    </Routes>
  </Router>
  );
};

export default App;
