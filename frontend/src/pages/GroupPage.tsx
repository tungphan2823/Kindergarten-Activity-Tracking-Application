import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUsers, selectUsers } from "../store/slices/userSlice";
import nonAva from "../assets/nonAva.jpg";
import Notify from "../components/NotifyProps";
import {
  fetchChildren,
  selectChildren,
  selectLoading as selectChildrenLoading,
  selectError as selectChildrenError,
} from "../store/slices/childrenSlice";
import {
  fetchGroups,
  createGroup,
  editGroup,
  selectGroups,
  selectLoading,
  selectError,
} from "../store/slices/groupSlice";
import { AppDispatch } from "../store/index";
import EditIcon from "@mui/icons-material/Edit";
import api from "../components/api";
// Interface for new group data
interface NewGroup {
  name: string;
  description: string;
  caretakerId: string; 
}

interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  groupId: string[];
}
// Interface for existing group data
interface Group {
  _id: string;
  name: string;
  description: string;
  slug: string;
  caretakerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const GroupPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showForm, setShowForm] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    description: "",
    caretakerId: "",
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const groups = useSelector(selectGroups);

  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const children = useSelector(selectChildren);
  const childrenLoading = useSelector(selectChildrenLoading);
  const childrenError = useSelector(selectChildrenError);
  const users = useSelector(selectUsers);
  const caretakers = users.filter((user) => user.role === "caretaker");
  const sortGroups = () => {
    const sorted = [...filteredGroups].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    setFilteredGroups(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  // Fetch groups when component mounts
  useEffect(() => {
    dispatch(fetchGroups());
    dispatch(fetchChildren());
    dispatch(fetchUsers());
  }, [dispatch]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/posts");
        setCurrentUser(response.data.userPosts);
        dispatch(fetchChildren());
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  useEffect(() => {
    if (groups && currentUser) {
      // @ts-expect-error
      let filteredGroup = [];
      if (currentUser.role === "caretaker") {
        filteredGroup = groups.filter(
          (group) => group.caretakerId._id === currentUser._id
        );
      } else if (currentUser.role === "manager") {
        filteredGroup = [...groups];
      }
      // @ts-expect-error
      setFilteredGroups(filteredGroup.reverse());
    }
  }, [groups, currentUser]);
  const handleChildClick = (childId: string) => {
    navigate(`/child/${childId}`);
  };
  const filteredChildren = selectedGroup
    ? children.filter((child) => child.groupId._id === selectedGroup._id)
    : [];
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewGroup({ ...newGroup, [e.target.name]: e.target.value });
  };

  // Handle form submission for creating or editing a group
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing && selectedGroup) {
        await dispatch(
          editGroup({ id: selectedGroup._id, updatedData: newGroup })
        );
        setNotification({
          show: true,
          message: "Group updated successfully!",
          type: "success",
        });
      } else {
        await dispatch(createGroup(newGroup));
        setNotification({
          show: true,
          message: "Group created successfully!",
          type: "success",
        });
      }
      setShowForm(false);
      setIsEditing(false);
      setNewGroup({ name: "", description: "", caretakerId: "" });
      setSelectedGroup(null);
    } catch (error) {
      setNotification({
        show: true,
        message: "An error occurred. Please try again.",
        type: "error",
      });
    }
  };
  // Handle selecting a group to view its details (without editing)
  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowForm(false); // Ensure the form is hidden when viewing details
    setIsEditing(false); // Not in editing mode
  };

  // Handle clicking the edit icon to start editing the selected group's data
  const handleEditClick = (group: Group) => {
    setSelectedGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      caretakerId: group.caretakerId._id,
    });
    setIsEditing(true);
    setShowForm(true); 
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="relative min-h-screen p-2 sm:p-6">
      <Notify
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>

      {currentUser?.role === "manager" && (
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setSelectedGroup(null);
            setNewGroup({ name: "", description: "", caretakerId: "" });
          }}
          className="fixed top-2 sm:top-10 right-2 sm:right-10 bg-blue-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
        >
          Create Group
        </button>
      )}

      {/* Main Card Container */}
      <div className="flex flex-col lg:flex-row w-full lg:w-3/4 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-16 sm:mt-20 lg:mt-0 min-h-[600px]">
        {/* Left Sidebar - List of Groups */}
        <div className="w-full lg:w-1/3 bg-white border-b lg:border-r lg:border-b-0 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            Groups List
          </h2>
          <button
            onClick={sortGroups}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
          >
            Sort {sortOrder === "asc" ? "↓" : "↑"}
          </button>
          <div className="max-h-[300px] lg:max-h-[500px] overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => handleSelectGroup(group)}
                  className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-200 ${
                    selectedGroup?._id === group._id ? "bg-gray-200" : ""
                  }`}
                >
                  {group.name}
                </div>
              ))
            ) : (
              <p>No groups found</p>
            )}
          </div>
        </div>

        {/* Right Side - Selected Group Info or Form */}
        <div className="flex flex-col w-full lg:w-2/3 p-4 sm:p-6 lg:p-10 bg-gray-50 overflow-y-auto">
          {!showForm ? (
            <div>
              {selectedGroup ? (
                <>
                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Left side - Image */}
                    <img
                      src={nonAva}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />

                    {/* Right side - Group Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>ID:</strong> {selectedGroup._id}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Description:</strong>{" "}
                        {selectedGroup.description}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Caretaker ID:</strong>{" "}
                        {selectedGroup.caretakerId._id}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Caretaker:</strong>{" "}
                        {selectedGroup.caretakerId.firstName}{" "}
                        {selectedGroup.caretakerId.lastName}
                      </p>
                    </div>

                    {/* Edit Icon */}
                    {currentUser?.role === "manager" && (
                      <EditIcon
                        onClick={() => handleEditClick(selectedGroup)}
                        className="absolute top-0 right-0 text-xl cursor-pointer text-blue-500"
                      />
                    )}
                  </div>

                  {/* Children List Section */}
                  <h3 className="text-lg sm:text-xl font-semibold my-4 sm:my-6">
                    Children in this Group
                  </h3>
                  {childrenLoading ? (
                    <p>Loading...</p>
                  ) : childrenError ? (
                    <p className="text-red-500">{childrenError}</p>
                  ) : filteredChildren.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredChildren.map((child) => (
                        <div
                          key={child._id}
                          className="flex items-center gap-3 p-3 sm:p-4 bg-white shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleChildClick(child._id)}
                        >
                          <img
                            src={nonAva}
                            alt={`${child.firstName} ${child.lastName}`}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="text-base sm:text-lg font-semibold">
                              {child.firstName} {child.lastName}
                            </h4>
                            <p className="text-sm sm:text-base">
                              <strong>Date of Birth:</strong>{" "}
                              {formatDate(child.dateOfBirth)}
                            </p>
                            <p className="text-sm sm:text-base">
                              <strong>Gender:</strong> {child.gender}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No children found for this group.</p>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Select a group to view details and its children
                  </h2>
                </div>
              )}
            </div>
          ) : (
            /* Form for creating or editing a group */
            <form
              onSubmit={handleSubmit}
              className="space-y-4 w-full max-w-md mx-auto"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                {isEditing ? "Edit Group" : "Create New Group"}
              </h2>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newGroup.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={newGroup.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="caretakerId"
                  className="block text-sm font-medium mb-1"
                >
                  Caretaker
                </label>
                <select
                  id="caretakerId"
                  name="caretakerId"
                  value={newGroup.caretakerId}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                >
                  <option value="">Select Caretaker</option>
                  {caretakers.map((caretaker) => (
                    <option key={caretaker._id} value={caretaker._id}>
                      {caretaker.firstName} {caretaker.lastName} (
                      {caretaker.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className={`py-2 px-4 rounded-full text-white text-sm sm:text-base w-full ${
                    isEditing
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full text-sm sm:text-base w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default GroupPage;
