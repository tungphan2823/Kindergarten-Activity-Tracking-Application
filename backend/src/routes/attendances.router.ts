var express = require("express");
import {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
} from "../controllers/attendance.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";
const attendancesRouter = express.Router();
attendancesRouter.post(
  "/",
  authenticateToken,
  // authorizeRoles("manager", "caretaker", "parent"),
  createAttendance
);
attendancesRouter.get(
  "/",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getAllAttendance
);
attendancesRouter.get(
  "/:id",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getAttendanceById
);
attendancesRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  updateAttendance
);
export { attendancesRouter };
