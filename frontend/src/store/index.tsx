// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import childrenReducer from "./slices/childrenSlice";
import groupReducer from "./slices/groupSlice";
import userReducer from "./slices/userSlice";
import attendanceReducer from "./slices/attendanceSlice";
import commentReducer from "./slices/commentSlice";
import additionParentReducer from "./slices/additionalParent";
import eventReducer from "./slices/eventSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    children: childrenReducer,
    groups: groupReducer,
    users: userReducer,
    attendance: attendanceReducer,
    comments: commentReducer,
    additionalParents: additionParentReducer,
    events: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
