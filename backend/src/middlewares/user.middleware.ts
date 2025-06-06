import { Request, Response, NextFunction } from "express";
import { Users } from "../models/index";
export async function authorizeUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const username = req.user?.username;
  const user = await Users.findOne({ username });
  if (!user) {
    return res
      .status(403)
      .json({ message: "Access denied: insufficient permissions." });
  }

  next();
}
