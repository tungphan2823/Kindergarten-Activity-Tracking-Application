
import mongoose from 'mongoose';

beforeAll(async () => {
  
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
  
  
  jest.spyOn(console, "Cannot log after tests are done").mockImplementation(() => {});
});

afterAll(async () => {
  
  await mongoose.disconnect();
});