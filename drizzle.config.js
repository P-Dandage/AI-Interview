

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url:'postgresql://ai-interview_owner:oLBN6c1iptMw@ep-raspy-bush-a8pie8l2.eastus2.azure.neon.tech/ai-interview?sslmode=require',
    }
  };