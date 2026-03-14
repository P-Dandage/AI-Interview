"use client";
import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Plus, Sparkles } from 'lucide-react';
import { db } from '@/utils/db';
import { mockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { generateInterviewQuestions } from '@/utils/Gemini_Ai_model';
import './AddnewInterview.css';

function AddnewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const questions = await generateInterviewQuestions(jobPosition, jobDesc, jobExperience);
      const mockJsonResp = JSON.stringify(questions);

      const resp = await db.insert(mockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: mockJsonResp,
          jobPosition,
          jobDesc,
          jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-YYYY'),
        })
        .returning({ mockId: mockInterview.mockId });

      if (resp?.[0]?.mockId) {
        setOpenDialog(false);
        router.push('/dashboard/Interview/' + resp[0].mockId);
      }
    } catch (err) {
      console.error("[IntraAi] Interview creation error:", err);
      // Show the real error message so it's easier to debug
      const msg = err?.message || String(err);
      alert("Failed to generate interview.\n\nError: " + msg + "\n\nCheck the browser console (F12) for full details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="add-new-card" onClick={() => setOpenDialog(true)}>
        <div className="add-new-icon">
          <Plus size={28} strokeWidth={2.5} />
        </div>
        <h3 className="add-new-title">New Interview</h3>
        <p className="add-new-desc">Set up a personalized AI mock interview</p>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="dialog-title">
              <Sparkles className="dialog-title-icon" size={20} />
              Create Your Mock Interview
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="interview-form">
            <p className="form-desc">
              Tell us about the role you're preparing for and we'll generate tailored interview questions.
            </p>

            <div className="field-group">
              <label className="field-label">Job Role / Position *</label>
              <Input
                placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager"
                required
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Tech Stack / Job Description *</label>
              <Textarea
                placeholder="e.g. React, Node.js, PostgreSQL, REST APIs — or paste the job description"
                required
                rows={4}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Years of Experience *</label>
              <Input
                placeholder="e.g. 0 (Fresher), 2, 5"
                type="number"
                min="0"
                max="30"
                required
                value={jobExperience}
                onChange={(e) => setJobExperience(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="form-footer">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="start-btn">
                {loading ? (
                  <><LoaderCircle className="animate-spin" size={16} /> Generating Questions...</>
                ) : (
                  <><Sparkles size={16} /> Generate Interview</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddnewInterview;