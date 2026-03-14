import { useRouter } from 'next/navigation';
import React from 'react';
import './Interviewcart.css';

function Interviewcart({ interview }) {
  const router = useRouter();

  return (
    <div className="icard">
      <div className="icard-header">
        <div className="icard-badge">{interview?.jobExperience || "0"}y exp</div>
      </div>
      <h3 className="icard-title">{interview?.jobPosition}</h3>
      <p className="icard-date">Created {interview.createdAt}</p>
      <div className="icard-desc">{interview?.jobDesc?.slice(0, 80)}{interview?.jobDesc?.length > 80 ? "..." : ""}</div>

      <div className="icard-actions">
        <button className="icard-btn icard-btn--outline" onClick={() => router.push('/dashboard/Interview/' + interview?.mockId + "/Feedback")}>
          View Feedback
        </button>
        <button className="icard-btn icard-btn--primary" onClick={() => router.push('/dashboard/Interview/' + interview?.mockId)}>
          Practice Again
        </button>
      </div>
    </div>
  );
}

export default Interviewcart;
