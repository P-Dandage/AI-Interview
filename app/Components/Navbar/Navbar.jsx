"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./Navbar.css";

const Navbar = ({ setPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setIsOpen(false);
    setPage("home");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => { setPage("home"); setIsOpen(false); }}>
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">IntraAi</span>
        </button>

        {/* Desktop menu */}
        <ul className="nav-links">
          {[
            { label: "Home",        action: () => setPage("home") },
            { label: "Features",    action: () => scrollTo("feature") },
            { label: "How it Works",action: () => scrollTo("how") },
            { label: "Team",        action: () => scrollTo("about") },
            { label: "Contact",     action: () => setPage("Contact") },
          ].map(({ label, action }) => (
            <li key={label}>
              <button className="nav-link-btn" onClick={action}>{label}</button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="nav-cta">
          <Link href="/dashboard">
            <button className="cta-btn">
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </Link>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          <span className={`bar ${isOpen ? "bar--open-1" : ""}`}/>
          <span className={`bar ${isOpen ? "bar--open-2" : ""}`}/>
          <span className={`bar ${isOpen ? "bar--open-3" : ""}`}/>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="mobile-menu">
          {[
            { label: "Home",        action: () => setPage("home") },
            { label: "Features",    action: () => scrollTo("feature") },
            { label: "How it Works",action: () => scrollTo("how") },
            { label: "Team",        action: () => scrollTo("about") },
            { label: "Contact",     action: () => setPage("Contact") },
          ].map(({ label, action }) => (
            <button key={label} className="mobile-link" onClick={() => { action(); setIsOpen(false); }}>
              {label}
            </button>
          ))}
          <Link href="/dashboard">
            <button className="mobile-cta" onClick={() => setIsOpen(false)}>Get Started →</button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
