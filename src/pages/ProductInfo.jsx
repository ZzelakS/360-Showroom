import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import ReactPlayer from "react-player";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import Modal from "react-modal";
import WalkaroundViewer from "../components/WalkaroundViewer/WalkaroundViewer"; // Import the component

const db = getFirestore(app);

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      const carRef = doc(db, "cars", id);
      const carSnap = await getDoc(carRef);
      
      if (carSnap.exists()) {
        console.log("Walkaround Images:", carSnap.data().walkaroundImages); // ✅ Log here
  
        setCar(carSnap.data());
        setHotspots(carSnap.data().hotspots || []);
      } else {
        navigate("/products");
      }
    };
    
    fetchCar();
  }, [id, navigate]);
  

  const openModal = (hotspot) => {
    setModalData(hotspot);
  };

  const closeModal = () => {
    setModalData(null);
  };

  if (!car) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-5">
      <motion.h1 
    className="text-4xl font-bold mb-6"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    {car.name}
  </motion.h1>

  {/* 360 Sphere Image */}
  {car.sphereImage ? (
    <div className="w-full max-w-3xl h-96 mb-4 relative">
      <ReactPhotoSphereViewer 
        src={car.sphereImage} 
        width="100%" 
        height="100%" 
        onClick={(e, data) => {
          const clickedHotspot = hotspots.find(h => h.yaw === data.yaw && h.pitch === data.pitch);
          if (clickedHotspot) openModal(clickedHotspot);
        }}
        markers={hotspots.map(hotspot => ({
          id: hotspot.id,
          tooltip: hotspot.label,
          position: { yaw: hotspot.yaw, pitch: hotspot.pitch }
        }))}
      />
    </div>
  ) : (
    <motion.img 
      src={car.image} 
      alt={car.name} 
      className="w-full max-w-3xl h-auto object-cover rounded-md mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    />
  )}

  <p className="text-lg text-gray-300 mb-4">{car.description}</p>

 {/* Walkaround iFrame Section */}
{car.iframeUrl ? (
  <div className="w-full max-w-3xl mb-6">
    <WalkaroundViewer walkaroundIframeUrl={car.iframeUrl} />
  </div>
) : (
  <p>No walkaround viewer available for this car.</p>
)}

  

  {/* Video Section */}
  {car.video && (
    <div className="w-full max-w-3xl mb-6">
      <ReactPlayer url={car.video} controls width="100%" height="auto" />
    </div>
  )}
      
      <motion.button
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-lg mt-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/products")}
      >
        Back to Products
      </motion.button>

      {/* Modal for Hotspot Details */}
      <Modal isOpen={!!modalData} onRequestClose={closeModal} className="modal bg-gray-800 p-6 rounded-md text-white max-w-lg mx-auto">
        {modalData && (
          <div>
            <h2 className="text-xl font-bold">{modalData.label}</h2>
            <p className="mt-2">{modalData.description}</p>
            <button onClick={closeModal} className="mt-4 bg-red-600 px-4 py-2 rounded">Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
