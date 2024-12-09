var express = require("express");
import {
  createGroup,
  getAllGroups,
  getGroupBySlug,
  editGroup,
} from "../controllers/groups.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";

const groupsRouter = express.Router();
groupsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("manager"),
  createGroup
);
groupsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getAllGroups
);
groupsRouter.get(
  "/:slug",
  authenticateToken,
  authorizeRoles("manager", "caretaker"),
  getGroupBySlug
);
groupsRouter.put("/:id", authenticateToken, editGroup);
export { groupsRouter };
