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

childrenRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("/", "manager", "caretaker"),
  getAllChildren
);
childrenRouter.get(
  "parent",
  authenticateToken,
  getChildrenByParentId
);
childrenRouter.get("/parent/:parentId", authenticateToken, getChild);
childrenRouter.put("/:id", authenticateToken, editChild);
export { childrenRouter };
