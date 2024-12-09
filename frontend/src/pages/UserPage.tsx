import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import nonAva from "../assets/nonAva.jpg"; 
import {
  fetchUsers,
  createUser,
  editUser,
  selectUsers,
  selectLoading,
  selectError,
} from "../store/slices/userSlice"; 
import { AppDispatch } from "../store/index";
import EditIcon from "@mui/icons-material/Edit";
import Notify from "../components/NotifyProps";
// Interface for new user data
interface NewUser {
  username: string;
  password: string;
  email: string;
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  role: string; // Add role field
}

// Interface for existing user data
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}

const UserPage = () => {
  const [reversedUsers, setReversedUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); 
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    password: "",
    email: "",
    dateOfBirth: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    role: "guest", // Default role to guest
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const sortUsers = () => {
    const sorted = [...reversedUsers].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    setReversedUsers(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  // Fetch users when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Handle form submission for creating or editing a user
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (isEditing && selectedUser) {
        await dispatch(editUser({ id: selectedUser._id, userData: newUser }));
        setNotification({
          show: true,
          message: "User updated successfully!",
          type: "success",
        });
      } else {
        await dispatch(createUser(newUser));
        setNotification({
          show: true,
          message: "User created successfully!",
          type: "success",
        });
      }
      setShowForm(false);
      setIsEditing(false);
      setNewUser({
        username: "",
        password: "",
        email: "",
        dateOfBirth: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        address: "",
        role: "",
      });
      setSelectedUser(null);
    } catch (error) {
      setNotification({
        show: true,
        message: "An error occurred. Please try again.",
        type: "error",
      });
    }
  };

  // Handle selecting a user to view their details (without editing)
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowForm(false); 
    setIsEditing(false); 
  };

  // Handle clicking the edit icon to start editing the selected user's data
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      password: "", 
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      role: user.role, // Pre-fill with current role
    });
    setIsEditing(true);
    setShowForm(true); // Show the form for editing
  };
  useEffect(() => {
    if (users) {
      setReversedUsers([...users].reverse());
    }
  }, [users]);
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

      {/* Create User Button */}
      <button
        onClick={() => {
          setShowForm(true);
          setIsEditing(false);
          setSelectedUser(null);
          setNewUser({
            username: "",
            password: "",
            email: "",
            dateOfBirth: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            address: "",
            role: "",
          });
        }}
        className="fixed top-2 sm:top-10 right-2 sm:right-10 bg-blue-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Create User
      </button>

      {/* Main Card Container */}
      <div className="flex flex-col lg:flex-row w-full lg:w-3/4 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-16 sm:mt-20 lg:mt-0 min-h-[600px]">
        {/* Left Sidebar - List of Users */}
        <div className="w-full lg:w-1/3 bg-white border-b lg:border-r lg:border-b-0 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            Users List
          </h2>
          <button
            onClick={sortUsers}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
          >
            Sort {sortOrder === "asc" ? "↓" : "↑"}
          </button>
          <div className="max-h-[300px] lg:max-h-[500px] overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : reversedUsers.length > 0 ? (
              reversedUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-200 ${
                    selectedUser?._id === user._id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-4">
                    <img
                      src={nonAva}
                      alt={user.firstName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        </div>

        {/* Right Side - Selected User Info or Form */}
        <div className="flex flex-col w-full lg:w-2/3 p-4 sm:p-6 lg:p-10 bg-gray-50">
          {!showForm ? (
            <>
              {selectedUser ? (
                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Left side - Image */}
                  <img
                    src={nonAva}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                  />

                  {/* Right side - User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>ID:</strong> {selectedUser._id}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>Role:</strong> {selectedUser.role}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>Date of Birth:</strong>{" "}
                      {formatDate(selectedUser.dateOfBirth)}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>Phone Number:</strong>{" "}
                      {selectedUser.phoneNumber || "N/A"}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm sm:text-base">
                      <strong>Address:</strong> {selectedUser.address || "N/A"}
                    </p>
                  </div>

                  {/* Edit Icon */}
                  <EditIcon
                    onClick={() => handleEditClick(selectedUser)}
                    className="absolute top-0 right-0 text-xl cursor-pointer text-blue-500"
                  />
                </div>
              ) : (
                <div className="text-center p-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">
                    Select a user to view details
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setIsEditing(false);
                      setSelectedUser(null);
                      setNewUser({
                        username: "",
                        password: "",
                        email: "",
                        dateOfBirth: "",
                        firstName: "",
                        lastName: "",
                        phoneNumber: "",
                        address: "",
                        role: "",
                      });
                    }}
                    className="bg-blue-500 text-white py-2 px-6 rounded-full w-full sm:w-auto text-sm sm:text-base"
                  >
                    Create User
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Form for creating or editing a user */
            <form
              onSubmit={handleSubmit}
              className="space-y-4 w-full max-w-md mx-auto"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                {isEditing ? "Edit User" : "Create New User"}
              </h2>

              {!isEditing && (
                <>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={newUser.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium mb-1"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium mb-1"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={newUser.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newUser.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={newUser.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={newUser.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number (Optional)"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1"
                >
                  Address (Optional)
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={newUser.address}
                  onChange={handleInputChange}
                  placeholder="Address (Optional)"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                >
                  <option value="">Select Role</option>
                  <option value="parent">Parent</option>
                  <option value="manager">Manager</option>
                  <option value="guest">Guest</option>
                  <option value="caretaker">Caretaker</option>
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

export default UserPage;
