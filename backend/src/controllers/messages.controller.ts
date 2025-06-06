import { Request, Response } from "express";
function getMessage(req: Request, res: Response) {
  res.send("Hello TypeScript with Express!");
}
export { getMessage };
