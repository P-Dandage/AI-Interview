// utils/saveContact.js
import { db } from '../utils/db';
import { contact } from '../utils/schema';

export const saveContactData = async ({ name, email, message }) => {
  try {
    await db.insert(contact).values({
      name,
      email,
      message,
      // createdAt will default to NOW() because of schema setting
    });
  } catch (error) {
    console.error("Error saving contact data:", error);
    throw error; // re-throw so caller can handle it
  }
};
