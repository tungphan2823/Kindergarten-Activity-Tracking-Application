import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  selectEvents,
  selectEventsLoading,
  selectEventsError,
  createEvent,
  editEvent,
} from "../store/slices/eventSlice";
import { fetchGroups, selectGroups } from "../store/slices/groupSlice";
import { AppDispatch } from "../store/index";
import api from "../components/api";

interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    groups: [],
  });

  const groups = useSelector(selectGroups);
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get("/auth/posts");
        setCurrentUser(data.userPosts);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchEvents());
      dispatch(fetchGroups());
    }
  }, [dispatch, currentUser]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  const getGroupName = (groupId: string) => {
    const group = groups.find((g) => g._id === groupId);
    return group ? group.name : "Unknown Group";
  };

  const sortEvents = () => {
    return [...events].sort(
      (a, b) =>
        new Date(sortOrder === "asc" ? a.startDate : b.startDate).getTime() -
        new Date(sortOrder === "asc" ? b.startDate : a.startDate).getTime()
    );
  };
  // @ts-expect-error
  const handleEditClick = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      // @ts-expect-error
      groups: event.groups.map((g) => g._id),
    });
    setShowForm(true);
  };

  const handleAddNewClick = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      groups: [],
    });
    setShowForm(true);
  };
  // @ts-expect-error
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingEvent) {
      // @ts-expect-error
      dispatch(editEvent({ id: editingEvent._id, eventData: formData }));
    } else {
      dispatch(createEvent(formData));
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div className="relative min-h-screen p-2 sm:p-6">
      <button
        onClick={() => navigate("/")}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Events</h1>
            {currentUser?.role === "manager" && (
              <div>
                <button
                  onClick={handleAddNewClick}
                  className="bg-green-500 text-white px-4 py-2 rounded-full mr-2"
                >
                  Add New Event
                </button>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded-full"
                >
                  Sort {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <div className="grid gap-4">
              {sortEvents().map((event) => (
                <div
                  key={event._id}
                  className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h2 className="text-lg font-semibold text-blue-600 mb-2">
                    {event.name}
                  </h2>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                      <span className="font-medium">Start:</span>{" "}
                      {formatDate(event.startDate)}
                    </div>
                    <div className="bg-green-50 px-3 py-1 rounded-full">
                      <span className="font-medium">End:</span>{" "}
                      {formatDate(event.endDate)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      Groups:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.groups.map((groupId) => (
                        <span
                          // @ts-expect-error
                          key={groupId}
                          className="bg-gray-200 px-2 py-1 rounded-full text-xs"
                        >
                          {
                            // @ts-expect-error
                            getGroupName(groupId)
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                  {currentUser?.role === "manager" && (
                    <button
                      onClick={() => handleEditClick(event)}
                      className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-full"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <h2 className="text-lg font-bold mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h2>
            <input
              type="text"
              placeholder="Event Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="block w-full p-2 border mb-3 rounded-md"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              className="block w-full p-2 border mb-3 rounded-md"
            />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
              className="block w-full p-2 border mb-3 rounded-md"
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
              className="block w-full p-2 border mb-3 rounded-md"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Groups (Hold Ctrl/Cmd to select multiple)
              </label>
              <select
                multiple
                value={formData.groups}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    // @ts-expect-error
                    groups: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
                required
                className="block w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                size={5}
              >
                {groups.map((group) => (
                  <option
                    key={group._id}
                    value={group._id}
                    className="p-2 hover:bg-blue-50"
                  >
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
