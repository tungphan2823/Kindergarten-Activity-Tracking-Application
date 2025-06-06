var express = require("express");
import {
  authenticationLogin,
  authenticationTest,
  authenticateToken,
  refreshTokenHandler,
  authenticationLogout,
} from "../controllers/auth.controller";
const authRouter = express.Router();
authRouter.post("/login", authenticationLogin);
authRouter.get("/posts", authenticateToken, authenticationTest);
authRouter.post("/token", refreshTokenHandler);
authRouter.delete("/logout", authenticationLogout);
export { authRouter };
