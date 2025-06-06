import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import EventsPage from "./pages/EventPage";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import GroupPage from "./pages/GroupPage";
import CreateChildPage from "./pages/CreateChildPage";
import ProtectedRoute from "./components/ProtectedRouteProps";
import UserPage from "./pages/UserPage";
import AttendancePage from "./pages/AttendancePage";
import CommentPage from "./pages/CommentPage";
import ParentAttenPage from "./pages/ParentAttenPage";
import ContactPage from "./pages/ContactPage";
import "./App.css";
const router = createBrowserRouter([
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/child",
    element: (
      <ProtectedRoute allowedRoles={["manager", "caretaker"]}>
        <CreateChildPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/child/:childId",
    element: (
      <ProtectedRoute allowedRoles={["manager", "caretaker"]}>
        <CreateChildPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={["manager"]}>
        <UserPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute allowedRoles={["manager", "caretaker"]}>
        <GroupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendances",
    element: (
      <ProtectedRoute allowedRoles={["caretaker"]}>
        <AttendancePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/comments",
    element: (
      <ProtectedRoute allowedRoles={["manager", "caretaker", "parent"]}>
        <CommentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/atten",
    element: (
      <ProtectedRoute allowedRoles={["parent"]}>
        <ParentAttenPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/contacts",
    element: (
      <ProtectedRoute>
        <ContactPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <EventsPage />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
