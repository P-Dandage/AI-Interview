"use client";
import './home.css';
import { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Main_section from "./Components/Main_section/Main_section";
import About from "./Components/About/About";
import Footer from "./Components/Footer/Footer";
import Feature from "./Components/Feature/Feature";
import How from "./Components/How/How";
import Contact from "./Components/Contact/Contact";

export default function Home() {
  const [page, setPage] = useState("home");

  return (
    <>
      <Navbar setPage={setPage} />

      {page === "home" && (
        <>
          <div className="hero-section" id="Home">
            <Main_section />
          </div>
          <div className="feature-section" id="feature">
            <Feature />
          </div>
          <div className="how-section" id="how">
            <How />
          </div>
          <div className="about-section" id="about">
            <About />
          </div>
          <div className="footer-section">
            <Footer setPage={setPage} />
          </div>
        </>
      )}

      {page === "Contact" && (
        <>
          <Contact />
          <div className="footer-section">
            <Footer setPage={setPage} />
          </div>
        </>
      )}
    </>
  );
}