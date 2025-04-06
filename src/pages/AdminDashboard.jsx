import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import WalkaroundViewer from "../components/WalkaroundViewer/WalkaroundViewer"; // Import WalkaroundViewer

const db = getFirestore(app);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sphereImageUrl, setSphereImageUrl] = useState([]); // Now an array
  const [videoUrl, setVideoUrl] = useState("");
  const [hotspots, setHotspots] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [cars, setCars] = useState([]);
  const [walkaroundIframeUrl, setWalkaroundIframeUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [brand, setBrand] = useState("");
  // const [sphereImageFilename, setSphereImageFilename] = useState("");
  // const [imageCount, setImageCount] = useState(43); // Set the number of images (e.g., 43 for Lexus)

  const fetchCars = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cars"));
      const carsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCars(carsData);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Restrict access if not authenticated
    } else {
      fetchCars(); // Call fetchCars after defining it
    }
  }, [user, navigate]); // Dependency array

  // Automatically construct the sphere image URL when brand is selected
useEffect(() => {
  if (brand) {
    setSphereImageUrl(`https://zzelaks.github.io/Assets/assets/${brand}/Interior/01.jpg`);
  } else {
    setSphereImageUrl("");
  }
}, [brand]);

// Submit new car
const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  // console.log("Walkaround Images Before Submission:", walkaroundImages);

  // Wait for state to update before submitting
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {

    await addDoc(collection(db, "cars"), {
      name,
      brand,
      description,
      image: imageUrl,
      sphereImage: sphereImageUrl,
      // video: videoUrl,
      iframeUrl: walkaroundIframeUrl,
      hotspots,
    });

    alert("Car added successfully!");
    setName("");
    setBrand("");
    setDescription("");
    setImageUrl("");
    // setVideoUrl("");
    setWalkaroundIframeUrl("");
    setHotspots([]);
  } catch (error) {
    console.error("Error adding car:", error);
  }

  setUploading(false);
};


  // Handle edit button click
  const handleEdit = (car) => {
    setEditingId(car.id);
    setName(car.name);
    setDescription(car.description);
    setImageUrl(car.image);
    setWalkaroundIframeUrl("");
    // setVideoUrl(car.video);
    setHotspots(car.hotspots || []);
  };

  // Delete car
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await deleteDoc(doc(db, "cars", id));
      alert("Car deleted successfully!");
      fetchCars(); // Refresh the list
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  // Add a new hotspot
  const addHotspot = () => {
    setHotspots([...hotspots, { id: Date.now(), label: "", yaw: 0, pitch: 0 }]);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen font-sans space-y-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Car Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg"
      >
        <input
          type="text"
          placeholder="Car Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white"
          required
        />

        <input
          type="text"
          placeholder="Car Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
          required
        />

        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
          required
        />

        {sphereImageUrl && (
          <img
            src={sphereImageUrl}
            alt="360 View"
            className="w-40 h-40 object-cover rounded-lg shadow-md"
          />
        )}

        {/* Render WalkaroundViewer */}
        {/* {brand && <WalkaroundViewer brand={brand} imageCount={43} />} */}

        <input
          type="text"
          placeholder="External Walkaround iFrame URL"
          value={walkaroundIframeUrl}
          onChange={(e) => setWalkaroundIframeUrl(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
        />

        {brand && sphereImageUrl && (
          <WalkaroundViewer brand={brand} imageUrl={sphereImageUrl} />
        )}

        {walkaroundIframeUrl && (
          <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            height: "1000px", // Increased height
            margin: "0 auto",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}
        >
            <iframe
              src={walkaroundIframeUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Walkaround Viewer"
              allowFullScreen
            />
          </div>
        )}

        {/* Video URL
        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
          required
        /> */}

        {/* Hotspots */}
        <h2 className="text-xl font-bold mt-4">Hotspots</h2>
        {hotspots.map((hotspot, index) => (
          <div key={hotspot.id} className="flex space-x-2">
            <input
              type="text"
              placeholder="Label"
              value={hotspot.label}
              onChange={(e) => {
                const newHotspots = [...hotspots];
                newHotspots[index].label = e.target.value;
                setHotspots(newHotspots);
              }}
              className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              required
            />
            <input
              type="number"
              placeholder="Yaw"
              value={hotspot.yaw}
              onChange={(e) => {
                const newHotspots = [...hotspots];
                newHotspots[index].yaw = parseFloat(e.target.value);
                setHotspots(newHotspots);
              }}
              className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              required
            />
            <input
              type="number"
              placeholder="Pitch"
              value={hotspot.pitch}
              onChange={(e) => {
                const newHotspots = [...hotspots];
                newHotspots[index].pitch = parseFloat(e.target.value);
                setHotspots(newHotspots);
              }}
              className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
              required
            />
          </div>
        ))}

        <button type="button" onClick={addHotspot} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Hotspot
        </button>
        <button type="submit" className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </form>

      {/* Car List with Delete Option */}
      <h2 className="text-2xl font-bold mt-6">Car List</h2>
      {cars.map((car) => (
        <div key={car.id} className="bg-gray-800 p-4 rounded-lg mt-2">
          <h2 className="text-xl font-bold">{car.name}</h2>
          <p>{car.description}</p>

          {car.sphereImage && (
            <img
              src={car.sphereImage} // Now dynamic based on Firebase data
              alt="360 View"
              className="w-40 h-40 object-cover rounded-lg shadow-md"
            />
          )}

          <div className="flex space-x-2 mt-2">
            <button onClick={() => handleEdit(car)} className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700">
              Edit
            </button>

            <button onClick={() => handleDelete(car.id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
