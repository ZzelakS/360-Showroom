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

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* ✅ Persisted across all pages */}
        <div className="pt-4 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/showroom" element={<Showroom />} />
            <Route path="/product/:id" element={<ProductInfo />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
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
