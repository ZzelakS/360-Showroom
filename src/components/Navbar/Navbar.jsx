// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../../../src/logo192.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`bg-gray-900 text-white px-6 py-4 shadow-md ${isOpen ? 'h-auto' : 'h-16'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-2xl font-bold">
          <NavLink to="/" onClick={closeMenu}>
            <img src={Logo} alt="VC360 Logo" className="mr-2 h-14 w-14 pb-1" />
          </NavLink>
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <NavLink to="/login" className="hover:text-gray-400" onClick={closeMenu}>Admin</NavLink>
          <NavLink to="/products" className="hover:text-gray-400" onClick={closeMenu}>Cars</NavLink>
          <NavLink to="/video360" className="hover:text-gray-400" onClick={closeMenu}>Videos</NavLink>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden mt-4 flex flex-col space-y-4 transform ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } transition-transform transition-opacity duration-500 ease-in-out`}
      >
        <NavLink to="/login" className="hover:text-gray-400" onClick={closeMenu}>Admin</NavLink>
        <NavLink to="/products" className="hover:text-gray-400" onClick={closeMenu}>Cars</NavLink>
        <NavLink to="/video360" className="hover:text-gray-400" onClick={closeMenu}>Videos</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
