import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function Products() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("cars"); // "cars" or "houses"
  const [cars, setCars] = useState([]);
  const [houses, setHouses] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [filter, setFilter] = useState("all");

  // Fetch cars or houses depending on mode
  useEffect(() => {
    const fetchItems = async () => {
      if (mode === "cars") {
        const carSnap = await getDocs(collection(db, "cars"));
        const carList = carSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCars(carList);
        setFilteredCars(carList);
      } else {
        const houseSnap = await getDocs(collection(db, "houses"));
        const houseList = houseSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHouses(houseList);
      }
    };
    fetchItems();
  }, [mode]);

  // Filter cars by brand
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
        {mode === "cars" ? "All Cars in Showroom" : "All Houses in Showroom"}
      </motion.h1>

      {/* Switch between Cars and Houses */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          className="bg-gray-800 text-white p-2 rounded-md"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="cars">Cars</option>
          <option value="houses">Houses</option>
        </select>

        {mode === "cars" && (
          <select 
            className="bg-gray-800 text-white p-2 rounded-md"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Brands</option>
            <option value="Tesla">Tesla</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
            {/* Add more brands as needed */}
          </select>
        )}
      </div>

      {/* Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 md:px-12">
        {mode === "cars"
          ? filteredCars.map((car) => (
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
            ))
          : houses.map((house) => (
              <motion.div 
                key={house.id} 
                className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center cursor-pointer hover:bg-gray-700 transition duration-300"
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/house-tour/${house.id}`)}
              >
                <motion.img 
                  src={house.image} 
                  alt={house.name} 
                  className="w-full h-40 object-cover rounded-md mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
                <h3 className="text-xl font-semibold">{house.name}</h3>
                <p className="text-sm text-gray-400">{house.description}</p>
              </motion.div>
            ))}
      </div>

      <motion.button
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-lg mt-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </motion.button>
    </div>
  );
}
