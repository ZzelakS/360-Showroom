import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const db = getFirestore(app);

export default function VRScene() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [aframeLoaded, setAframeLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchHouse = async () => {
      const houseRef = doc(db, "houses", id);
      const houseSnap = await getDoc(houseRef);
      if (houseSnap.exists()) {
        setHouse(houseSnap.data());
      } else {
        navigate("/products");
      }
    };
    fetchHouse();
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

  if (!house || !aframeLoaded) {
    return <div className="text-white text-center mt-10">Loading VR...</div>;
  }

  const handleHotspotClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="w-screen h-screen bg-black">
      <a-scene embedded vr-mode-ui="enabled: false">
        <a-assets>
          {house.sphereImages?.map((image, index) => (
            <img
              key={index}
              id={`vr-sphere-${index}`}
              src={image}
              crossOrigin="anonymous"
            />
          ))}
        </a-assets>

        {/* Ambient light so we can see entities */}
        <a-entity light="type: ambient; color: #ffffff"></a-entity>

        {/* Camera + cursor */}
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

        {/* 360 background image */}
        <a-sky
          id="image-sky"
          radius="10"
          src={`#vr-sphere-${currentImageIndex}`}
          rotation="0 0 0"
        ></a-sky>

        {/* Back Button */}
        <a-entity
          id="backButton"
          position="0 2 -3"
          geometry="primitive: plane; height: 0.3; width: 0.8"
          material="color: red"
          text="value: Back; align: center; color: white"
        ></a-entity>

        {/* Hotspots */}
        {house.sphereImages.map((img, index) =>
          index !== currentImageIndex ? (
            <a-entity
              key={index}
              position={`${-2 + index * 2} 1.5 -3`}
              geometry="primitive: sphere; radius: 0.2"
              material="color: yellow"
              event-set__mouseenter="_event: mouseenter; scale: 1.2 1.2 1.2"
              event-set__mouseleave="_event: mouseleave; scale: 1 1 1"
              onClick={() => handleHotspotClick(index)}
            >
              <a-text
                value={`Room ${index + 1}`}
                align="center"
                position="0 0.4 0"
                color="white"
              ></a-text>
            </a-entity>
          ) : null
        )}
      </a-scene>
    </div>
  );
}
