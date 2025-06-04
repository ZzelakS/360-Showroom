import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import WalkaroundViewer from "../components/WalkaroundViewer/WalkaroundViewer"; // Import WalkaroundViewer

const db = getFirestore(app);

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sphereImageUrl, setSphereImageUrl] = useState("");
  const [walkaroundIframeUrl, setWalkaroundIframeUrl] = useState("");
  const [mediaType, setMediaType] = useState("car");
  const [cars, setCars] = useState([]);
  const [houses, setHouses] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [hotspots, setHotspots] = useState([]);
  const [hotspotPitch, setHotspotPitch] = useState("");
  const [hotspotYaw, setHotspotYaw] = useState("");
  const [hotspotType, setHotspotType] = useState("link");
  const [hotspotText, setHotspotText] = useState("");
  const [hotspotUrl, setHotspotUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const carsSnapshot = await getDocs(collection(db, "cars"));
      const carsList = carsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCars(carsList);

      const housesSnapshot = await getDocs(collection(db, "houses"));
      const housesList = housesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHouses(housesList);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (mediaType === "car") {
        await addDoc(collection(db, "cars"), {
          name,
          brand,
          description,
          image: imageUrl,
          sphereImage: sphereImageUrl,
          iframeUrl: walkaroundIframeUrl,
          hotspots,
        });
      } else {
        const imagesArray = sphereImageUrl.split(",").map((url) => url.trim());
        await addDoc(collection(db, "houses"), {
          name,
          description,
          image: imageUrl,
          sphereImages: imagesArray,
        });
      }
      alert(`${mediaType === "car" ? "Car" : "House"} added successfully!`);
      setName("");
      setBrand("");
      setDescription("");
      setImageUrl("");
      setSphereImageUrl("");
      setWalkaroundIframeUrl("");
      setHotspots([]);
    } catch (error) {
      console.error("Error adding data:", error);
    }
    setUploading(false);
  };

  const handleDelete = async (id, type) => {
    await deleteDoc(doc(db, type, id));
    if (type === "cars") {
      setCars(cars.filter((car) => car.id !== id));
    } else {
      setHouses(houses.filter((house) => house.id !== id));
    }
  };

  const addHotspot = () => {
    setHotspots([
      ...hotspots,
      { pitch: hotspotPitch, yaw: hotspotYaw, type: hotspotType, text: hotspotText, URL: hotspotUrl },
    ]);
    setHotspotPitch("");
    setHotspotYaw("");
    setHotspotType("link");
    setHotspotText("");
    setHotspotUrl("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="mb-4">
          <label className="block mb-1">Select Media Type:</label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
          >
            <option value="car">Car</option>
            <option value="house">House</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
            required
          />

          {mediaType === "car" && (
            <>
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
                placeholder="External Walkaround iFrame URL"
                value={walkaroundIframeUrl}
                onChange={(e) => setWalkaroundIframeUrl(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
              />
            </>
          )}

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            required
          />

          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
            required
          />

          {mediaType === "car" && (
            <>
              <input
                type="text"
                placeholder="360 Sphere Interior Image URL"
                value={sphereImageUrl}
                onChange={(e) => setSphereImageUrl(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              />

              <div className="space-y-2">
                <h3 className="font-semibold">Add Hotspots</h3>
                <input
                  type="text"
                  placeholder="Pitch"
                  value={hotspotPitch}
                  onChange={(e) => setHotspotPitch(e.target.value)}
                  className="p-2 rounded bg-gray-700 border border-gray-600 w-full"
                />
                <input
                  type="text"
                  placeholder="Yaw"
                  value={hotspotYaw}
                  onChange={(e) => setHotspotYaw(e.target.value)}
                  className="p-2 rounded bg-gray-700 border border-gray-600 w-full"
                />
                <select
                  value={hotspotType}
                  onChange={(e) => setHotspotType(e.target.value)}
                  className="p-2 bg-gray-700 border border-gray-600 rounded w-full"
                >
                  <option value="link">Link</option>
                  <option value="info">Info</option>
                </select>
                <input
                  type="text"
                  placeholder="Text"
                  value={hotspotText}
                  onChange={(e) => setHotspotText(e.target.value)}
                  className="p-2 rounded bg-gray-700 border border-gray-600 w-full"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={hotspotUrl}
                  onChange={(e) => setHotspotUrl(e.target.value)}
                  className="p-2 rounded bg-gray-700 border border-gray-600 w-full"
                />
                <button
                  type="button"
                  onClick={addHotspot}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Hotspot
                </button>
              </div>
            </>
          )}

          {mediaType === "house" && (
            <>
              <label className="block font-semibold">360 Interior Image URLs (comma separated)</label>
              <input
                type="text"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                value={sphereImageUrl}
                onChange={(e) => setSphereImageUrl(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white"
                required
              />
            </>
          )}

          <button
            type="submit"
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </form>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Cars</h2>
          <ul className="space-y-2">
            {cars.map((car) => (
              <li key={car.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-center">
                  <span>{car.name} - {car.brand}</span>
                  <button
                    onClick={() => handleDelete(car.id, "cars")}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Houses</h2>
          <ul className="space-y-2">
            {houses.map((house) => (
              <li key={house.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-center">
                  <span>{house.name}</span>
                  <button
                    onClick={() => handleDelete(house.id, "houses")}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
