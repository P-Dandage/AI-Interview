"use client";
import { db } from '@/utils/db';
import { mockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import Interviewcart from './Interviewcart';
import { motion, AnimatePresence } from 'framer-motion';

function InterviewList() {
  const { user } = useUser();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    const results = await db.select().from(mockInterview)
      .where(eq(mockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(mockInterview.id));
    setList(results);
    setLoading(false);
  };

  if (loading) return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ fontFamily: "Sora,sans-serif", fontSize: 16, fontWeight: 700, color: "#05264e", marginBottom: 20 }}>Previous Interviews</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: "#f8faff", borderRadius: 18, height: 160, animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: "#05264e", margin: 0 }}>
          Previous Interviews
        </h2>
        {list.length > 0 && (
          <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13, color: "#94a3b8" }}>
            {list.length} session{list.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#f8faff", borderRadius: 18, border: "1.5px dashed #c7d2fe" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
          <p style={{ fontFamily: "Sora,sans-serif", fontSize: 15, fontWeight: 600, color: "#05264e", marginBottom: 6 }}>No interviews yet</p>
          <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: 14, color: "#64748b" }}>Create your first mock interview above to get started!</p>
        </div>
      ) : (
        <motion.div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <AnimatePresence>
            {list.map((interview) => (
              <motion.div key={interview.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                exit={{ opacity: 0 }}
              >
                <Interviewcart interview={interview} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default InterviewList;
