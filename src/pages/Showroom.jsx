import React, { useState, useEffect } from "react";
import "aframe";
import "aframe-extras";
import { db, auth, storage } from "../firebaseConfig";  // ✅ Import initialized Firebase
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function VC360Showroom() {
  const [carModels, setCarModels] = useState({});
  const [selectedCar, setSelectedCar] = useState("");
  const [view, setView] = useState("exterior");
  const [newCar, setNewCar] = useState({ name: "", exterior: null, interior: null });
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function fetchCarModels() {
      const querySnapshot = await getDocs(collection(db, "carModels"));
      let models = {};
      querySnapshot.forEach((doc) => {
        models[doc.id] = doc.data();
      });
      setCarModels(models);

      // ✅ Only set `selectedCar` if models exist
      if (Object.keys(models).length > 0) {
        setSelectedCar(Object.keys(models)[0]);
      }
    }
    fetchCarModels();
  }, []);


  const handleCarChange = (e) => {
    setSelectedCar(e.target.value);
  };

  const toggleView = () => {
    setView(view === "exterior" ? "interior" : "exterior");
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `cars/${Date.now()}-${file.name}`); // ✅ Prevents overwriting
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const addCarModel = async () => {
    const exteriorURL = await uploadImage(newCar.exterior);
    const interiorURL = await uploadImage(newCar.interior);
    const docRef = await addDoc(collection(db, "carModels"), {
      name: newCar.name,
      exterior: exteriorURL,
      interior: interiorURL
    });
    setCarModels({ ...carModels, [docRef.id]: { name: newCar.name, exterior: exteriorURL, interior: interiorURL } });
    setNewCar({ name: "", exterior: null, interior: null });
  };

  const deleteCarModel = async (carId) => {
    await deleteDoc(doc(db, "carModels", carId));
    let updatedModels = { ...carModels };
    delete updatedModels[carId];
    setCarModels(updatedModels);
  };


  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Allow only specific admin emails
      const allowedAdmins = ["adamsskalezz@gmail.com"]; // Add more admins if needed
      if (allowedAdmins.includes(user.email)) {
        setUser(user);
      } else {
        alert("You are not an admin!");
        await signOut(auth); // Immediately sign out unauthorized users
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };




  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
  {user ? (
    user.email === "admin@example.com" ? (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    ) : (
      <div className="bg-red-100 p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <button 
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    )
  ) : (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="w-full p-2 border rounded mb-2"
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="w-full p-2 border rounded mb-4"
      />
      <button 
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  )}

  <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, exterior: e.target.files[0] })} className="w-full p-2 border rounded mb-2" />
    <input type="file" accept="image/*" onChange={(e) => setNewCar({ ...newCar, interior: e.target.files[0] })} className="w-full p-2 border rounded mb-2" />
    <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={addCarModel}>Add Car</button>
  </div>

  <h2 className="text-2xl font-bold mt-6">Car Showroom</h2>
  <select onChange={handleCarChange} value={selectedCar} className="w-full p-2 border rounded mb-4">
    {Object.keys(carModels).map((car) => (
      <option key={car} value={car}>{carModels[car].name.toUpperCase()}</option>
    ))}
  </select>
  <button className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600" onClick={toggleView}>Switch View</button>
  
  <div className="mt-6">
    <a-scene>
      <a-sky src={carModels[selectedCar]?.[view]}></a-sky>
      <a-camera position="0 1.6 0">
        <a-cursor></a-cursor>
      </a-camera>
    </a-scene>
  </div>

  <h2 className="text-2xl font-bold mt-6">Manage Cars</h2>
  <div className="mt-4">
    {Object.keys(carModels).map((car) => (
      <div key={car} className="flex justify-between items-center bg-gray-200 p-4 rounded mb-2">
        <span className="font-medium">{carModels[car].name}</span>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => deleteCarModel(car)}
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>
                                                                                                                                                                                                                                                                           )
}
