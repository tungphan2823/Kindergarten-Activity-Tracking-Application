// src/tests/auth.test.ts
import { Request, Response } from "express";
import { authenticationLogin } from "../controllers/auth.controller";
import bcrypt from "bcrypt";

jest.mock("../models", () => ({
  Users: {
    findOne: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

describe("Authentication Login", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should successfully login with correct credentials", async () => {
    
    mockRequest = {
      body: {
        username: "testuser",
        password: "correctpassword", 
      },
    };

   
    const mockUser = {
      _id: "123",
      username: "testuser",
      password: "hashedpassword", // Hashed version of 'correctpassword'
      role: "parent",
    };

  
    require("../models").Users.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true); 

    await authenticationLogin(mockRequest as Request, mockResponse as Response);

   
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    );
  });

  it("should fail when user does not exist", async () => {
    // Setup mock request with non-existent user credentials
    mockRequest = {
      body: {
        username: "nonexistentuser",
        password: "anypassword",
      },
    };

    // Mock user not found in the database
    require("../models").Users.findOne.mockResolvedValue(null); // No user found

    await authenticationLogin(mockRequest as Request, mockResponse as Response);

    // Expect a 401 Unauthorized response with an error message
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("should fail when password is incorrect", async () => {
    // Setup mock request with incorrect password
    mockRequest = {
      body: {
        username: "testuser",
        password: "wrongpassword", // Incorrect password
      },
    };

    const mockUser = {
      _id: "123",
      username: "testuser",
      password: "hashedpassword", // Hashed version of the correct password
      role: "parent",
    };

    // Mock user found but password comparison fails
    require("../models").Users.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Simulate failed password comparison

    await authenticationLogin(mockRequest as Request, mockResponse as Response);

    // Expect a 401 Unauthorized response with an error message
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("should handle server errors", async () => {
    // Setup mock request with valid credentials but simulate server error
    mockRequest = {
      body: {
        username: "testuser",
        password: "password",
      },
    };

    // Mock a database error during user lookup
    require("../models").Users.findOne.mockRejectedValue(new Error("Database error"));

    await authenticationLogin(mockRequest as Request, mockResponse as Response);

    // Expect a 500 Internal Server Error response with an appropriate message
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Server error",
      })
    );
  });
});