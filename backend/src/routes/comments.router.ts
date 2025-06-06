var express = require("express");
import {
  createComment,
  getAllComments,
  editComment,
} from "../controllers/comments.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";
const commentsRouter = express.Router();
commentsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("caretaker"),

  createComment
);
commentsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("caretaker", "parent"),
  getAllComments
);
commentsRouter.put(
  "/:commentId",
  authenticateToken,
  authorizeRoles("caretaker"),
  editComment
);

export { commentsRouter };
