'use client';
import { useState, useEffect } from 'react';
import './Feedback-form.css';
import { saveFeedback, getAllFeedbacks } from '@/utils/feedbackActions';

const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const avatarColors = [
  '#6366f1', '#8b5cf6', '#0ea5e9', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#14b8a6',
];

export default function FeedbackForm() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: '', interviewTopic: '', email: '', feedbackText: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllFeedbacks()
      .then(all => setFeedbacks([...all].reverse()))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await saveFeedback(form);
      setSubmitted(true);
      setForm({ name: '', interviewTopic: '', email: '', feedbackText: '' });
      const updated = await getAllFeedbacks();
      setFeedbacks([...updated].reverse());
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const doubled = feedbacks.length > 0 ? [...feedbacks, ...feedbacks] : [];

  return (
    <div className="fb-page">

      {/* ── Page Header ── */}
      <div className="fb-header">
        <div className="fb-label">✦ COMMUNITY</div>
        <h1 className="fb-title">What Our <span>Users Say</span></h1>
        <p className="fb-sub">Real feedback from real people who practiced with IntraAi.</p>
      </div>

      {/* ── Testimonial Slider ── */}
      {feedbacks.length > 0 ? (
        <div className="fb-slider-wrap">
          <div className="fb-slider">
            {doubled.map((fb, idx) => (
              <div className="fb-card" key={idx}>
                {/* Avatar */}
                <div className="fb-card-top">
                  <div
                    className="fb-avatar"
                    style={{ background: avatarColors[fb.name?.charCodeAt(0) % avatarColors.length] }}
                  >
                    {getInitials(fb.name)}
                  </div>
                  <div>
                    <div className="fb-card-name">{fb.name}</div>
                    <div className="fb-card-topic">{fb.interviewTopic}</div>
                  </div>
                </div>
                {/* Stars */}
                <div className="fb-stars">{'★'.repeat(5)}</div>
                {/* Text */}
                <p className="fb-card-text">"{fb.feedbackText}"</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="fb-empty-slider">
          <p>Be the first to share your experience! 👇</p>
        </div>
      )}

      {/* ── Form Section ── */}
      <div className="fb-form-section">
        <div className="fb-form-header">
          <div className="fb-label">✦ SHARE YOUR EXPERIENCE</div>
          <h2 className="fb-form-title">Tell Us What <span>You Think</span></h2>
          <p className="fb-form-sub">Your honest feedback helps us make IntraAi better for everyone.</p>
        </div>

        <div className="fb-form-card">
          {submitted ? (
            <div className="fb-success">
              <div className="fb-success-icon">🎉</div>
              <h3>Thank you!</h3>
              <p>Your feedback has been submitted and will appear in the slider above.</p>
              <button className="fb-btn fb-btn--primary" onClick={() => setSubmitted(false)}>
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="fb-form-row">
                <div className="fb-field">
                  <label>Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="Prathamesh Dandage" required disabled={loading} />
                </div>
                <div className="fb-field">
                  <label>Interview Topic *</label>
                  <input name="interviewTopic" value={form.interviewTopic} onChange={handleChange}
                    placeholder="e.g. Full Stack, DSA, React" required disabled={loading} />
                </div>
              </div>

              <div className="fb-field">
                <label>Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required disabled={loading} />
              </div>

              <div className="fb-field">
                <label>Your Feedback *</label>
                <textarea name="feedbackText" value={form.feedbackText} onChange={handleChange}
                  placeholder="Share how IntraAi helped you prepare, what you liked, or what we can improve..."
                  rows="5" required disabled={loading} />
              </div>

              {error && <p className="fb-error">{error}</p>}

              <button type="submit" className="fb-btn fb-btn--primary fb-btn--full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback →'}
              </button>
            </form>
          )}
        </div>

        {/* Note */}
        <p className="fb-note">
          We read every piece of feedback. Your honest opinions — praise, suggestions, or criticism —
          directly shape IntraAi's roadmap. Thank you for taking the time. 🙏
        </p>
      </div>

    </div>
  );
}