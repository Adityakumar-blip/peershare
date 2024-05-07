import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Client from "./Client";
import Receiver from "./Receiver";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Client />} />
        <Route path="/receiver/:roomId" element={<Receiver />} />
      </Routes>
    </Router>
  );
};

export default App;
