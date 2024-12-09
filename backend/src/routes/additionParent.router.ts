var express = require("express");
import {
  createAdditionalParent,
  getAllAdditionalParents,
  getAdditionalParentById,
  editAdditionalParent,
  deleteAdditionalParent,
} from "../controllers/additionParent.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";

const additionalParentRouter = express.Router();

additionalParentRouter.get("/", authenticateToken, getAllAdditionalParents);

additionalParentRouter.post("/", authenticateToken, createAdditionalParent);

additionalParentRouter.get("/:id", authenticateToken, getAdditionalParentById);

additionalParentRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("manager"),
  editAdditionalParent
);

additionalParentRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("manager"),
  deleteAdditionalParent
);

export { additionalParentRouter };
