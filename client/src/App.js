import React from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Onboard from "./pages/Onboard";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Trash from "./pages/Trash";

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Onboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/team" element={<Team />} />
        <Route path="/trash" element={<Trash />} />
      </Routes>
    </>
  );
};

export default App;
