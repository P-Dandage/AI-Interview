
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";


export const contact = pgTable('contact', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});


export const mockInterview=pgTable('mockInterview',{
    id:serial('id').primaryKey(),
    jsonMockResp:text('jsonMockResp').notNull(),
    jobPosition:varchar('jobPosition').notNull(),
    jobDesc:varchar('jobDesc').notNull(),
    jobExperience:varchar('jobExperience').notNull(),
    createdBy:varchar('createdBy').notNull(),
    createdAt:varchar('createdAt').notNull(),
    mockId:varchar("mockId").notNull()
})

export const useAnswer=pgTable('userAnswer',{
    id:serial('id').primaryKey(),
    mockIdRef:varchar("mockId").notNull(),
    question:varchar('question').notNull(),
    correctAns:text('correctAns').notNull(),
    userAns:text('userAns').notNull(),
    feedback:text('feedback').notNull(),
    rating:varchar('rating').notNull(),
    userEmail:varchar('userEmail').notNull(),
    createdAt:varchar('createdAt').notNull(),
     



})

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  interviewTopic: varchar('interviewTopic', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  feedbackText: text('feedbackText').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});



