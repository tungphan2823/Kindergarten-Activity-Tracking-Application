import express from "express";
import { getMessage } from "./controllers/messages.controller";
import { attendancesRouter } from "./routes/attendances.router";
import { usersRouter } from "./routes/users.router";
import { groupsRouter } from "./routes/groups.router";
import { childrenRouter } from "./routes/children.router";
import { commentsRouter } from "./routes/comments.router";
import { authRouter } from "./routes/auth.router";
import { additionalParentRouter } from "./routes/additionParent.router";
import { eventsRouter } from "./routes/events.router";
import cors from "cors";

import helmet from "helmet";
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://thesis-frontend-muvx.onrender.com",
  ],
  optionsSuccessStatus: 200,
};
const app = express();
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.get("/", getMessage);
app.use("/users", usersRouter);
app.use("/groups", groupsRouter);
app.use("/children", childrenRouter);
app.use("/attendances", attendancesRouter);
app.use("/comments", commentsRouter);
app.use("/auth", authRouter);
app.use("/additionParent", additionalParentRouter);

app.use("/events", eventsRouter);
export { app };
