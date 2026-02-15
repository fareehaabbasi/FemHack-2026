import React from "react";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import { Route, Routes } from "react-router-dom";
import Auth from "./Components/Auth";

const App = () => {
  return (
    <div>
      <Navbar />

      <Routes >
        {/* <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lostfound" element={<LostFound />} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="/volunteer" element={<Volunteer />} /> */}
      <Route path="/Authentication" element={<Auth />} />
      </Routes>

      {/* <Footer /> */}
    </div>
  );
};

export default App;
