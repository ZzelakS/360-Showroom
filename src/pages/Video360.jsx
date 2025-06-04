import 'aframe';
import { useEffect, useState, useRef } from 'react';

const Video360 = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleSceneLoaded = () => {
      const video = document.getElementById("vid");
      if (video) {
        video.muted = true;
        video.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.warn("Video play failed:", err));
      }
    };

    const scene = document.querySelector("a-scene");
    if (scene?.hasLoaded) {
      handleSceneLoaded();
    } else {
      scene?.addEventListener("loaded", handleSceneLoaded);
    }

    return () => {
      scene?.removeEventListener("loaded", handleSceneLoaded);
    };
  }, []);

  const handlePlayPause = () => {
    const video = document.getElementById("vid");
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    } else if (containerRef.current?.webkitRequestFullscreen) {
      containerRef.current.webkitRequestFullscreen(); // Safari
    }
  };

  return (
    <div className="relative w-full h-[500px] border border-gray-400 rounded-md overflow-hidden" ref={containerRef}>
      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-3">
        <button
          onClick={handlePlayPause}
          className="bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={enterFullscreen}
          className="bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200"
        >
          Fullscreen
        </button>
      </div>

      {/* A-Frame Scene */}
      <a-scene embedded className="w-full h-full">
        <a-assets>
          <video
            id="vid"
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            src="/Glo.mp4"
          ></video>
        </a-assets>

        <a-videosphere src="#vid"></a-videosphere>
        <a-entity camera look-controls wasd-controls position="0 1.6 0"></a-entity>
      </a-scene>
    </div>
  );
};

export default Video360;
