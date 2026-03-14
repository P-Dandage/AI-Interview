import React from 'react';
import Link from 'next/link';
import './Footer.css';

const Footer = ({ setPage }) => {
  const scrollTo = (id) => {
    setPage("home");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <footer className="footer-container">
      <div className="footer-inner">
        {/* Brand col */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="footer-logo-text">IntraAi</span>
          </div>
          <p className="footer-brand-desc">
            The AI-powered mock interview platform helping students and professionals land their dream jobs through realistic practice and instant feedback.
          </p>
          <div className="footer-social">
            <a href="https://github.com/P-Dandage/Ai-mock-Interviwer" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="GitHub">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product */}
        <div className="footer-col">
          <h4 className="footer-col-title">Product</h4>
          <ul className="footer-links">
            <li><button onClick={() => scrollTo("feature")}>Features</button></li>
            <li><button onClick={() => scrollTo("how")}>How it Works</button></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/dashboard/ConfidenceBooster">Confidence Booster</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul className="footer-links">
            <li><button onClick={() => scrollTo("about")}>About Team</button></li>
            <li><button onClick={() => setPage("Contact")}>Contact Us</button></li>
            <li><Link href="/dashboard/how">How It Works Guide</Link></li>
            <li><Link href="/dashboard/Feedback-form">User Feedback</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <p className="footer-contact-item">
            <span>📧</span> team@intraai.in
          </p>
          <p className="footer-contact-item">
            <span>📍</span> Maharashtra, India
          </p>
          <div className="footer-badge">
            <span>🇮🇳</span> Made in India
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
