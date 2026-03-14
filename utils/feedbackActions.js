// utils/feedbackActions.js
import { db } from './db';               // ✅ same folder
import { feedback } from './schema';    // ✅ same folder

// Save feedback
export async function saveFeedback({ name, interviewTopic, email, feedbackText }) {
  if (!name || !interviewTopic || !email || !feedbackText) {
    throw new Error('All fields are required');
  }

  try {
    await db.insert(feedback).values({ name, interviewTopic, email, feedbackText });
    return { success: true };
  } catch (error) {
    console.error('Insert Error:', error);
    throw new Error('Database error');
  }
}

// Get all feedback
export async function getAllFeedbacks() {
  try {
    const results = await db.select().from(feedback).orderBy(feedback.createdAt);
    return results;
  } catch (error) {
    console.error('Fetch Error:', error);
    throw new Error('Failed to fetch feedbacks');
  }
}
