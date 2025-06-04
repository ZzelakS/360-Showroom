import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Viewer } from "photo-sphere-viewer";
import MarkersPlugin from "photo-sphere-viewer/dist/plugins/markers.js"; // ✅ correct import
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";

const db = getFirestore(app);

export default function HouseTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef();
  const viewerRef = useRef(null);
  const [house, setHouse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchHouse = async () => {
      const docRef = doc(db, "houses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHouse(docSnap.data());
      } else {
        navigate("/house");
      }
    };
    fetchHouse();
  }, [id, navigate]);

  useEffect(() => {
    if (!house || !house.sphereImages?.length || !containerRef.current) return;

    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: house.sphereImages[currentIndex],
      navbar: ["zoom", "fullscreen", "autorotate"],
      plugins: [[MarkersPlugin]], // ✅ wrapped in array
    });

    viewerRef.current = viewer;

    const markersPlugin = viewer.getPlugin(MarkersPlugin);

    // Add interactive navigation hotspots
    if (house.sphereImages.length > 1) {
      markersPlugin.addMarker({
        id: "next-view",
        longitude: 0.5,
        latitude: 0.1,
        image: "https://cdn-icons-png.flaticon.com/512/271/271228.png",
        width: 32,
        height: 32,
        anchor: "bottom center",
        tooltip: "Next View",
        data: { type: "next" },
      });

      markersPlugin.addMarker({
        id: "prev-view",
        longitude: -0.5,
        latitude: 0.1,
        image: "https://cdn-icons-png.flaticon.com/512/271/271220.png",
        width: 32,
        height: 32,
        anchor: "bottom center",
        tooltip: "Previous View",
        data: { type: "prev" },
      });

      markersPlugin.on("select-marker", (e, marker) => {
        if (marker?.data?.type === "next") {
          setCurrentIndex((prev) => (prev + 1) % house.sphereImages.length);
        } else if (marker?.data?.type === "prev") {
          setCurrentIndex((prev) => (prev - 1 + house.sphereImages.length) % house.sphereImages.length);
        }
      });
    }

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [house, currentIndex]);

  if (!house) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="p-4 text-white flex flex-col items-center min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4">{house.name}</h1>
      <div className="w-full max-w-4xl h-96 mb-4 rounded-md" ref={containerRef} />
      <p className="text-gray-300 mt-4 text-center max-w-xl">{house.description}</p>
    </div>
  );
}
