"use client";
import { useState } from "react";
import { saveContactData } from '@/utils/saveContact';
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await saveContactData(formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="section-label-brand">✦ GET IN TOUCH</div>
        <h2 className="contact-heading">We'd love to <span className="contact-heading-accent">hear from you</span></h2>
        <p className="contact-sub">Have a question, feedback, or partnership idea? Drop us a message.</p>
      </div>

      <div className="contact-wrapper">
        {/* Info cards */}
        <div className="contact-info">
          {[
            { icon: "📧", label: "Email", value: "team@intraai.in" },
            { icon: "📍", label: "Location", value: "Maharashtra, India" },
            { icon: "🕐", label: "Response Time", value: "Within 24 hours" },
          ].map(({ icon, label, value }) => (
            <div className="contact-info-card" key={label}>
              <div className="contact-info-icon">{icon}</div>
              <div>
                <div className="contact-info-label">{label}</div>
                <div className="contact-info-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="contact-form-card">
          {submitted ? (
            <div className="contact-success">
              <div className="success-icon">✅</div>
              <h3>Message Sent!</h3>
              <p>Thank you! We'll get back to you within 24 hours.</p>
              <button className="contact-submit" onClick={() => setSubmitted(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="form-title">Send a Message</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Prathamesh Dandage" required disabled={loading} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required disabled={loading} />
                </div>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Tell us about your feedback, questions, or ideas..." required disabled={loading} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="contact-submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
