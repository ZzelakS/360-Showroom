import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function Products() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchCars = async () => {
      const querySnapshot = await getDocs(collection(db, "cars"));
      const carsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCars(carsList);
      setFilteredCars(carsList);
    };
    fetchCars();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredCars(cars);
    } else {
      setFilteredCars(cars.filter((car) => car.brand === filter));
    }
  }, [filter, cars]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-5">
      <motion.h1 
        className="text-4xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        All Cars in Showroom
      </motion.h1>
      
      <div className="mb-4">
        <select 
          className="bg-gray-800 text-white p-2 rounded-md"
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Brands</option>
          <option value="Tesla">Tesla</option>
          <option value="BMW">BMW</option>
          <option value="Audi">Audi</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 md:px-12">
        {filteredCars.map((car) => (
          <motion.div 
            key={car.id} 
            className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center cursor-pointer hover:bg-gray-700 transition duration-300"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/product/${car.id}`)}
          >
            <motion.img 
              src={car.image} 
              alt={car.name} 
              className="w-full h-40 object-cover rounded-md mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
            <h3 className="text-xl font-semibold">{car.name}</h3>
            <p className="text-sm text-gray-400">{car.brand}</p>
          </motion.div>
        ))}
      </div>
      
      <motion.button
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-lg mt-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </motion.button>
    </div>
  );
}