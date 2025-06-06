var express = require("express");
import {
  createUser,
  getAllUsers,
  getUserBySlug,
  editUser,
  getUserById,
} from "../controllers/users.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";
const usersRouter = express.Router();
usersRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("manager", "caretaker"),
  getAllUsers
);
usersRouter.put("/:id", authenticateToken, editUser);
usersRouter.get("/:id", authenticateToken, getUserById);
usersRouter.get(
  "/:slug",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getUserBySlug
);
usersRouter.post("/", authenticateToken, createUser);
export { usersRouter };
