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
  
  createAttendance
);
attendancesRouter.get(
  "manager",
  authenticateToken,
  authorizeRoles("caretaker", "parent", "/"),
  getAllAttendance
);
attendancesRouter.get(
  "manager",
  authenticateToken,
  authorizeRoles("caretaker", "parent", "/:id"),
  getAttendanceById
);
attendancesRouter.put(
  "manager",
  authenticateToken,
  authorizeRoles("caretaker", "parent", "/:id"),
  updateAttendance
);
export { attendancesRouter };
