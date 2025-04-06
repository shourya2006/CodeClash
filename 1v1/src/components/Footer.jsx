import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Code Clash</h3>
          <p>
            Challenge your coding skills in real-time battles. Join the
            community of competitive programmers.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav className="footer-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a
              href="https://github.com/shourya2006"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i> GitHub
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-discord" style={{fontSize: '1rem'}}></i> Discord
            </a>
            <a
              href="https://www.linkedin.com/in/shourya-bafna-80a670215/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i> LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Code Clash. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
