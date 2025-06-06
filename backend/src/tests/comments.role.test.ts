
import { Request, Response, NextFunction } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";

interface JwtUserPayload {
  id: string;
  username: string;
  role: string;
}

describe("Comments Role Authorization", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("POST /comments", () => {
    it("should allow caretaker to create comment", () => {
      mockRequest = {
        user: {
          id: "123",
          username: "caretaker1",
          role: "caretaker"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should deny parent access to create comment", () => {
      mockRequest = {
        user: {
          id: "124",
          username: "parent1",
          role: "parent"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });

    it("should deny manager access to create comment", () => {
      mockRequest = {
        user: {
          id: "125",
          username: "manager1",
          role: "manager"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });
  });

  describe("GET /comments", () => {
    it("should allow caretaker to get all comments", () => {
      mockRequest = {
        user: {
          id: "123",
          username: "caretaker1",
          role: "caretaker"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker", "parent");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should allow parent to get all comments", () => {
      mockRequest = {
        user: {
          id: "124",
          username: "parent1",
          role: "parent"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker", "parent");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should deny manager access to get all comments", () => {
      mockRequest = {
        user: {
          id: "125",
          username: "manager1",
          role: "manager"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker", "parent");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });
  });

  describe("PUT /comments/:commentId", () => {
    it("should allow caretaker to edit comment", () => {
      mockRequest = {
        user: {
          id: "123",
          username: "caretaker1",
          role: "caretaker"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should deny parent access to edit comment", () => {
      mockRequest = {
        user: {
          id: "124",
          username: "parent1",
          role: "parent"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });
  });

  describe("Error cases", () => {
    it("should deny access when no user in request", () => {
      mockRequest = {};

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });

    it("should deny access when role is missing", () => {
      mockRequest = {
        user: {
          id: "127",
          username: "noRole"
        } as any
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });

    it("should deny access with invalid role", () => {
      mockRequest = {
        user: {
          id: "128",
          username: "invalidRole",
          role: "invalid_role"
        } as JwtUserPayload
      };

      const middleware = authorizeRoles("caretaker");
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Access denied: insufficient permissions."
      });
    });
  });
});