import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import ReactPlayer from "react-player";
import Modal from "react-modal";
import WalkaroundViewer from "../components/WalkaroundViewer/WalkaroundViewer";

// Three.js imports
import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const db = getFirestore(app);

export default function ProductInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [renderer, setRenderer] = useState(null);
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
    if (!car || !car.sphereImage) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      vrContainerRef.current.clientWidth / vrContainerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(
      vrContainerRef.current.clientWidth,
      vrContainerRef.current.clientHeight
    );
    newRenderer.xr.enabled = true;

    vrContainerRef.current.innerHTML = "";
    vrContainerRef.current.appendChild(newRenderer.domElement);

    const controls = new OrbitControls(camera, newRenderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(car.sphereImage, (texture) => {
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
    });

    newRenderer.setAnimationLoop(() => {
      controls.update();
      newRenderer.render(scene, camera);
    });

    setRenderer(newRenderer);

    return () => {
      newRenderer.setAnimationLoop(null);
    };
  }, [car]);

  const openVRMode = async () => {
    if (renderer) {
      const session = await navigator.xr.requestSession("immersive-vr", {
        optionalFeatures: ["local-floor", "bounded-floor"],
      });
      renderer.xr.setSession(session);
    }
  };

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
            className="w-full max-w-3xl h-96 mb-4 bg-black rounded-md"
          ></div>
          <button
            onClick={openVRMode}
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
