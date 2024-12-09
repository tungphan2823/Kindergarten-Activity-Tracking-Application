import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
require("dotenv").config();
import "../index";
import { Users } from "../models/index";
import bcrypt from "bcrypt";
interface User {
  _id: string;
  username: string;
  password: string;
  email: string;
  role: "manager" | "caretaker" | "parent";
  dateOfBirth: Date;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  slug: string;
}

interface JwtUserPayload extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

// Extend Express Request interface to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

// In-memory storage for refresh tokens
let refreshTokens: string[] = [];

// Token generation functions
function generateAccessToken(user: JwtUserPayload) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "50m", // Adjust token expiry as needed
  });
}

function generateRefreshToken(user: JwtUserPayload) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d", // Adjust refresh token expiry
  });
}

// Login function
async function authenticationLogin(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userPayload: JwtUserPayload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    
    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// Refresh token function
async function refreshTokenHandler(req: Request, res: Response) {
  const { token: refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  try {
    const userPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtUserPayload;

    const newAccessToken = generateAccessToken({
      id: userPayload.id,
      username: userPayload.username,
      role: userPayload.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

// Logout function (removes the refresh token from memory)
async function authenticationLogout(req: Request, res: Response) {
  const { token: refreshToken } = req.body;

  // Remove the refresh token from the in-memory array
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);

  res.sendStatus(204);
}

// Middleware for protecting routes
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token required" });

  try {
    const userPayload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtUserPayload;
    req.user = userPayload;  
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired access token" });
  }
}


async function authenticationTest(req: Request, res: Response) {
  const username = req.user?.username;
  if (!username) return res.status(401).json({ message: "Unauthorized" });

  const userPosts = await Users.findOne({ username });
  res.json({ userPosts });
}

export {
  authenticationLogin,
  authenticationTest,
  authenticateToken,
  refreshTokenHandler,
  authenticationLogout
};
