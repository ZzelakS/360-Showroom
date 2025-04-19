import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function VRScene() {
  const { id } = useParams(); // Fetch house ID from URL
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track current image

  // Fetch house data from Firestore based on ID
  useEffect(() => {
    const fetchHouse = async () => {
      const houseRef = doc(db, "houses", id); // Fetch from 'houses' collection
      const houseSnap = await getDoc(houseRef);
      if (houseSnap.exists()) {
        setHouse(houseSnap.data()); // Store house data in state
      } else {
        navigate("/products"); // Redirect if house not found
      }
    };
    fetchHouse();
  }, [id, navigate]);

  // Back button functionality
  useEffect(() => {
    const btn = document.getElementById("backButton");
    if (btn) {
      const handleClick = () => navigate(`/product/${id}`);
      btn.addEventListener("click", handleClick);

      return () => btn.removeEventListener("click", handleClick);
    }
  }, [id, navigate]);

  // Load A-Frame library if not loaded
  useEffect(() => {
    if (!window.AFRAME) {
      const script = document.createElement("script");
      script.src = "https://aframe.io/releases/1.4.2/aframe.min.js";
      script.onload = () => setAframeLoaded(true);
      document.head.appendChild(script);
    } else {
      setAframeLoaded(true);
    }
  }, []);

  if (!house || !aframeLoaded) {
    return <div className="text-white text-center mt-10">Loading VR...</div>;
  }

  // Function to handle hotspot click
  const handleHotspotClick = (index) => {
    setCurrentImageIndex(index); // Update to the clicked hotspot's image
  };

  return (
    <div className="w-screen h-screen bg-black">
      <a-scene embedded vr-mode-ui="enabled: true">
        <a-assets>
          {/* Load all the 360 interior images */}
          {house.sphereImages?.map((image, index) => (
            <img
              key={index}
              id={`vr-sphere-${index}`}
              src={image}
              crossOrigin="anonymous"
            />
          ))}
        </a-assets>

        {/* Camera + Cursor for interactivity */}
        <a-entity position="0 1.6 0">
          <a-camera>
            <a-cursor
              fuse="true"
              fuse-timeout="500"
              geometry="primitive: ring; radiusInner: 0.01; radiusOuter: 0.02"
              material="color: white; shader: flat"
            ></a-cursor>
          </a-camera>
        </a-entity>

        {/* 360 Background (only display the current image) */}
        <a-sky
          src={`#vr-sphere-${currentImageIndex}`}
          rotation="0 -130 0"
          animation="property: rotation; to: 0 230 0; loop: true; dur: 50000; easing: linear"
        />

        {/* Interactive Back Button */}
        <a-entity
          id="backButton"
          position="0 1.6 -2"
          geometry="primitive: plane; height: 0.1; width: 0.3"
          material="color: red"
          text="value: Back; align: center; color: white"
          event-set__mouseenter="_event: mouseenter; material.color: orange"
          event-set__mouseleave="_event: mouseleave; material.color: red"
        ></a-entity>

        {/* Hotspots for Navigation */}
        {/* Living Room Hotspot */}
        <a-entity
          position="1 1.6 -4"
          geometry="primitive: sphere; radius: 0.1"
          material="color: green"
          class="clickable"
          event-set__click="material.color: yellow"
          onClick={() => handleHotspotClick(1)} // Navigate to next room (image)
        >
          <a-text
            value="Living Room"
            align="center"
            position="0 0.2 0"
            color="white"
          ></a-text>
        </a-entity>

        {/* Kitchen Hotspot */}
        <a-entity
          position="-1 1.6 -3"
          geometry="primitive: sphere; radius: 0.1"
          material="color: blue"
          class="clickable"
          event-set__click="material.color: yellow"
          onClick={() => handleHotspotClick(2)} // Navigate to the kitchen (image)
        >
          <a-text
            value="Kitchen"
            align="center"
            position="0 0.2 0"
            color="white"
          ></a-text>
        </a-entity>

        {/* Bedroom Hotspot */}
        <a-entity
          position="2 1.6 -5"
          geometry="primitive: sphere; radius: 0.1"
          material="color: red"
          class="clickable"
          event-set__click="material.color: yellow"
          onClick={() => handleHotspotClick(3)} // Navigate to bedroom (image)
        >
          <a-text
            value="Bedroom"
            align="center"
            position="0 0.2 0"
            color="white"
          ></a-text>
        </a-entity>

      </a-scene>
    </div>
  );
}
