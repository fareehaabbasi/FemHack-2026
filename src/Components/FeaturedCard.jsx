import React from "react";

function FeatureCard({ title, description, img, link }) {
  return (
    <div
      className="feature-card border rounded p-4 text-center bg-white"
      style={{
        transition: "transform 0.2s",
      }}
    >
      <img src={img} alt={title} className="img-fluid" />
      <h5 className="mt-3" style={{ color: "#0057a8" }}>
        {title}
      </h5>
      <p style={{ color: "#333" }}>{description}</p>
      <a
        href={link}
        className="btn"
        style={{
          backgroundColor: "#66b032",
          color: "white",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#0057a8")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#66b032")}
      >
        Go
      </a>
    </div>
  );
}

export default FeatureCard;
