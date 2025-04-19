import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function VRScene() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);

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
    const btn = document.getElementById("backButton");
    if (btn) {
      const handleClick = () => navigate(`/product/${id}`);
      btn.addEventListener("click", handleClick);

      return () => btn.removeEventListener("click", handleClick);
    }
  }, [id, navigate]);

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

  if (!car || !aframeLoaded) {
    return <div className="text-white text-center mt-10">Loading VR...</div>;
  }

  return (
    <div className="w-screen h-screen bg-black">
      <a-scene embedded vr-mode-ui="enabled: true">
        <a-assets>
          <img id="vr-sphere" src={car.sphereImage} crossOrigin="anonymous" />
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

        {/* 360 Background */}
        <a-sky
          src="#vr-sphere"
          rotation="0 -130 0"
          animation="property: rotation; to: 0 230 0; loop: true; dur: 50000; easing: linear"
        ></a-sky>

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
      </a-scene>
    </div>
  );
}
