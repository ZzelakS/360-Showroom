import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function Home() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      const querySnapshot = await getDocs(collection(db, "cars"));
      const carsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCars(carsList.slice(0, 3)); // Show only 3 cars on homepage
    };
    fetchCars();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-6">
      
      <motion.h1 
        className="text-5xl font-extrabold mb-4 text-blue-400"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to VR Place Virtual Showroom
      </motion.h1>
      
      <motion.p
        className="text-lg text-gray-300 mb-8 max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        Explore cars like never before with our 360° interactive experience. Get a real feel of each car from every angle.
      </motion.p>

      {/* Car Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
      >
        {cars.map((car) => (
          <motion.div 
            key={car.id} 
            className="bg-gray-800 p-5 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/product/${car.id}`)}
          >
            <img src={car.image} alt={car.name} className="w-full h-44 object-cover rounded-md mb-3" />
            <h3 className="text-xl font-semibold">{car.name}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <motion.button
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-medium shadow-md transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/products")}
        >
          All Products
        </motion.button>

        <motion.button
          className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg text-lg font-medium shadow-md transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
        >
          Admin Login
        </motion.button>
      </div>
      
    </div>
  );
}
