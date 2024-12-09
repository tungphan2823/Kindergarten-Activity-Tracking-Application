var express = require("express");
import {
  createEvent,
  getAllEvents,
  getEventById,
  editEvent,
  deleteEvent,
} from "../controllers/events.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticateToken } from "../controllers/auth.controller";

const eventsRouter = express.Router();

eventsRouter.get("/", authenticateToken, getAllEvents);

eventsRouter.post(
  "/",
  authenticateToken,
  authorizeRoles("manager"),
  createEvent
);

eventsRouter.get(
  "/:id",
  authenticateToken,
  authorizeRoles("manager", "caretaker", "parent"),
  getEventById
);

eventsRouter.put(
  "/:id",
  authenticateToken,
  authorizeRoles("manager"),
  editEvent
);

eventsRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("manager"),
  deleteEvent
);

export { eventsRouter };
