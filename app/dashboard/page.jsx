import { UserButton } from '@clerk/nextjs';
import React from 'react';
import AddnewInterview from './_components/AddnewInterview';
import InterviewList from './_components/InterviewList';

function Dashboard() {
  return (
    <div style={{ padding: "32px 0" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 4, height: 28, background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: 99 }} />
          <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: 26, fontWeight: 800, color: "#05264e", margin: 0 }}>
            Dashboard
          </h1>
        </div>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 15, color: "#64748b", margin: 0 }}>
          Create a new AI mock interview or continue from where you left off.
        </p>
      </div>

      {/* New Interview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 280px))", gap: 16, marginBottom: 48 }}>
        <AddnewInterview />
      </div>

      {/* Interview List */}
      <InterviewList />
    </div>
  );
}

export default Dashboard;
