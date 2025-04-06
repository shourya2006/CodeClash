import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import Alert from "./Alert";
import "../css/Contact.css";

const Contact = () => {
  const form = useRef();
  const [alert, setAlert] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlert({
      isVisible: true,
      type,
      message,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm("service_o3l358l", "template_12a3sne", form.current, {
        publicKey: "fzhDcDvFX7FFj6Eki",
      })
      .then(
        () => {
          showAlert("success", "Email sent successfully!");
          setTimeout(() => {
            window.location.replace("http://localhost:3000/");
          }, 2000);
        },
        (error) => {
          showAlert("error", `Failed to send email: ${error.text}`);
        }
      );
  };

  return (
    <div className="contact-page">
      <Alert
        type={alert.type}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
      />

      <h1 className="contact-title">Get in Touch</h1>
      <div className="contact-container">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <p>shourya.bafna2024@nst.rishihood.edu.in</p>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <p>Ahemedabad, Gujarat, India</p>
          </div>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <p>+91 70021 79266</p>
          </div>
          <div className="social-links">
            <a
              href="https://github.com/shourya2006"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
              <p>Github</p>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-discord"></i>
              <p>Discord</p>
            </a>
            <a
              href="https://www.linkedin.com/in/shourya-bafna-80a670215/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
              <p>Linkedin</p>
            </a>
          </div>
          <p className="contact-description">
            Connect with us on social media to stay updated with the latest
            features, participate in community discussions, and join our growing
            network of developers.
          </p>
        </div>

        <form className="contact-form" onSubmit={sendEmail} ref={form}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required></textarea>
          </div>
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
