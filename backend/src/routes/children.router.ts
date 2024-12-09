var express = require("express");
import {
  createChild,
  getAllChildren,
  getChild,
  editChild,
  getChildrenByParentId,
} from "../controllers/children.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";
const childrenRouter = express.Router();
childrenRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("manager"),
  createChild
);
// childrenRouter.post("/", createChild);
childrenRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getAllChildren
);
childrenRouter.get(
  "/parent/:parentId",
  authenticateToken,
  getChildrenByParentId
);
childrenRouter.get("/:id", authenticateToken, getChild);
childrenRouter.put("/:id", authenticateToken, editChild);
export { childrenRouter };
