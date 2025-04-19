import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import ReactPlayer from "react-player";
import Modal from "react-modal";
import WalkaroundViewer from "../components/WalkaroundViewer/WalkaroundViewer";

// Import Photo Sphere Viewer
import { Viewer } from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';

const db = getFirestore(app);

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [viewer, setViewer] = useState(null);
  const vrContainerRef = useRef();

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

    const viewer = new Viewer({
      container: vrContainerRef.current,
      panorama: car.sphereImage,
      navbar: [
        'zoom',
        'fullscreen', // Add the fullscreen control to the navbar
        'autorotate',
      ],
    });

    setViewer(viewer);

    // Access internal Three.js renderer and enable XR
    const threeRenderer = viewer.renderer.renderer; // Three.js WebGLRenderer
    const canvas = threeRenderer.domElement;

    // Check if browser supports XR
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          const button = document.createElement('button');
          button.innerText = 'Enter VR';
          button.style.position = 'absolute';
          button.style.bottom = '10px';
          button.style.right = '10px';
          button.onclick = () => {
            navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] })
              .then((session) => {
                threeRenderer.xr.enabled = true;
                threeRenderer.xr.setSession(session);
                viewer.render(); // start rendering
              });
          };
          vrContainerRef.current.appendChild(button);
        }
      });
    }

    return () => {
      viewer.destroy();
    };
  }, [car]);

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

      {/* 360 VR Viewer */}
      {car.sphereImage ? (
        <>
          <div
            ref={vrContainerRef}
            className="w-full max-w-3xl h-96 mb-4 bg-black rounded-md relative"
          >
            {/* Fullscreen Icon
            <div
              className="absolute top-4 right-4 text-white cursor-pointer"
              onClick={() => viewer.requestFullscreen()}
              title="Toggle Fullscreen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 9l3-3-3-3M18 15l3 3-3 3M14 6h6a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h6"
                />
              </svg>
            </div> */}
          </div>

          <button
  onClick={() => navigate(`/vr-view/${id}`)}
  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mb-6 text-lg"
>
  Enter VR Mode
</button>

        </>
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

      {/* Walkaround Viewer */}
      {car.iframeUrl ? (
        <div className="w-full max-w-3xl mb-6">
          <WalkaroundViewer walkaroundIframeUrl={car.iframeUrl} />
        </div>
      ) : (
        <p>No walkaround viewer available for this car.</p>
      )}

      {/* Video Section
      {car.video && (
        <div className="w-full max-w-3xl mb-6">
          <ReactPlayer url={car.video} controls width="100%" height="auto" />
        </div>
      )} */}

      <motion.button
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-lg mt-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/products")}
      >
        Back to Products
      </motion.button>

      {/* Hotspot Modal */}
      <Modal
        isOpen={!!modalData}
        onRequestClose={closeModal}
        className="modal bg-gray-800 p-6 rounded-md text-white max-w-lg mx-auto"
      >
        {modalData && (
          <div>
            <h2 className="text-xl font-bold">{modalData.label}</h2>
            <p className="mt-2">{modalData.description}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-red-600 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
