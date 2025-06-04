import React from "react";
import "./index.css"; // Ensure Tailwind or your styles are included
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navbar from "../src/components/Navbar/Navbar"; // ✅ Add this
import Home from "../src/pages/Home";
import Showroom from "../src/pages/Showroom";
import ProductInfo from "../src/pages/ProductInfo";
import AdminDashboard from "../src/pages/AdminDashboard";
import Login from "../src/pages/Login";
import Products from "../src/pages/Products";
import ProtectedRoute from "./ProtectedRoute";
import VRScene from "./pages/VRScene";
import HouseTour from "./pages/HouseTour";
import Video360 from "./pages/Video360";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* ✅ Persisted across all pages */}
        <div className="max-w-screen overflow-x-hidden">
          <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/showroom" element={<Showroom />} />
  <Route path="/product/:id" element={<ProductInfo />} />
  <Route path="/products" element={<Products />} />
  <Route path="/login" element={<Login />} />
  <Route path="/vr-view/:id" element={<VRScene />} />
  <Route path="/house-tour/:id" element={<HouseTour />} />
  <Route path="/video360" element={<Video360 />} /> {/* ✅ Add this */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
