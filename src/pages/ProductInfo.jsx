import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import Modal from "react-modal";

import { Viewer } from "photo-sphere-viewer";
import MarkersPlugin from "photo-sphere-viewer/dist/plugins/markers.js";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";

const db = getFirestore(app);

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [modalData, setModalData] = useState(null);
  const vrContainerRef = useRef();
  const viewerRef = useRef(null);

  useEffect(() => {
    const fetchCar = async () => {
      const carRef = doc(db, "cars", id);
      const carSnap = await getDoc(carRef);

      if (carSnap.exists()) {
        setCar(carSnap.data());
      } else {
        navigate("/products");
      }
    };

    fetchCar();
  }, [id, navigate]);

  useEffect(() => {
    if (!car || !car.sphereImage || !vrContainerRef.current) return;

    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    const viewer = new Viewer({
      container: vrContainerRef.current,
      panorama: car.sphereImage,
      plugins: [
        [MarkersPlugin, {
          markers: [
            {
              id: "living-room",
              longitude: 0.3,
              latitude: 0.1,
              image: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              width: 32,
              height: 32,
              anchor: "bottom center",
              tooltip: "Living Room",
              data: {
                label: "Living Room",
                description: "This is the spacious living room.",
              },
            },
            {
              id: "kitchen",
              longitude: 1.5,
              latitude: -0.1,
              image: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
              width: 32,
              height: 32,
              anchor: "bottom center",
              tooltip: "Kitchen",
              data: {
                label: "Kitchen",
                description: "This is the modern kitchen.",
              },
            },
          ],
        }]
      ],
      navbar: ["zoom", "fullscreen", "autorotate"],
    });

    viewerRef.current = viewer;

    viewer.once("ready", () => {
      const markersPlugin = viewer.getPlugin(MarkersPlugin);
      markersPlugin.on("select-marker", (e, marker) => {
        setModalData(marker.data);
      });
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [car]);

  const closeModal = () => setModalData(null);

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

      {car.sphereImage ? (
        <div
          ref={vrContainerRef}
          className="w-full max-w-3xl h-96 mb-4 bg-black rounded-md relative"
        />
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

      {/* ... your walkaround viewer or fallback */}

      <motion.button
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-lg mt-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/products")}
      >
        Back to Products
      </motion.button>

      <Modal
        isOpen={!!modalData}
        onRequestClose={closeModal}
        className="modal bg-gray-800 p-6 rounded-md text-white max-w-lg mx-auto"
        ariaHideApp={false}
      >
        {modalData && (
          <>
            <h2 className="text-xl font-bold">{modalData.label}</h2>
            <p className="mt-2">{modalData.description}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-600 px-4 py-2 rounded"
            >
              Close
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}
