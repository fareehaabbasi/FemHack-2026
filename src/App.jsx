import React from "react";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import { Route, Routes } from "react-router-dom";
import Auth from "./Components/Auth";
import Dashboard from "./Pages/Dashboard";
import LostFound from "./Pages/LostFound";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home";
import Volunteer from "./Pages/Voluntair";
import Complaint from "./Pages/Complain";


const App = () => {
  return (
    <div>
      <Navbar />

      <Routes >

        <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Volunteer" element={<Volunteer/>} />
      <Route path="/Complaints" element={<Complaint/>} />

        <Route path="/" element={<Home/> } />
      <Route
  path="/Dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/LostFound"
  element={
    <ProtectedRoute>
      <LostFound />
    </ProtectedRoute>
  }
/>

<Route
  path="/Authentication"
  element={
      <Auth />
  }
/>


{/* <Route
  path="/complaints"
  element={
    <ProtectedRoute>
      <Complaints />
    </ProtectedRoute>
  }
/>

<Route
  path="/volunteer"
  element={
    <ProtectedRoute>
      <Volunteer />
    </ProtectedRoute>
  }
/> */}
      </Routes>

      {/* <Footer /> */}
    </div>
  );
};

export default App;
