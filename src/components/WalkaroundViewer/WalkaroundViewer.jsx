import React from "react";

const WalkaroundViewer = ({ walkaroundIframeUrl }) => {
  if (!walkaroundIframeUrl) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        height: "1000px",
        margin: "0 auto",
        overflow: "hidden",
        borderRadius: "12px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <iframe
        src={walkaroundIframeUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
        allowFullScreen
        title="360 Viewer"
      >
        Browser not compatible.
      </iframe>
    </div>
  );
};

export default WalkaroundViewer;
