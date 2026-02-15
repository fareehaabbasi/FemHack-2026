import React from "react";

function Hero() {
  return (
    <section className="py-5 text-center" style={{ backgroundColor: "#66b032", color: "white" }}>
      <div className="container">
        <h1 className="display-5 fw-bold">Welcome to Saylani Mass IT Hub</h1>
        <p className="lead">
          A portal for students & staff to manage Lost & Found, Complaints, Volunteers, and Real-Time Updates
        </p>
        <a href="#lostfound" className="btn btn-light btn-lg">
          Get Started
        </a>
      </div>
    </section>
  );
}

export default Hero;
