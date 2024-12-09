// src/tests/setup.ts
import mongoose from 'mongoose';

beforeAll(async () => {
  // Disable actual database connection during tests
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
  
  // Mock console.log to prevent "Cannot log after tests are done" warning
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(async () => {
  // Clean up and close the MongoDB connection
  await mongoose.disconnect();
});