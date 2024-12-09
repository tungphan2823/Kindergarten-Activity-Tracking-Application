import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Notify from "../components/NotifyProps";
import nonAva from "../assets/nonAva.jpg"; 
import {
  fetchChildren,
  createChild,
  editChild,
  selectChildren,
  selectLoading,
  selectError,
} from "../store/slices/childrenSlice";
import { AppDispatch } from "../store/index";
import { fetchGroups, selectGroups } from "../store/slices/groupSlice";
import {
  selectAdditionalParents,
  createAdditionalParent,
  editAdditionalParent,
  fetchAdditionalParents,
} from "../store/slices/additionalParent";
import {
  fetchAttendances,
  selectAttendances,
} from "../store/slices/attendanceSlice";
import EditIcon from "@mui/icons-material/Edit";
import api from "../components/api";
import { useParams } from "react-router-dom";
interface NewChild {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string;
  groupId: string;
  gender: string;
  monthlyTime?: number;
}

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
  };
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  gender: string;
  monthlyTime: number;
}
interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
  groupId: string[];
}
const CreateChildPage = () => {
  const { childId } = useParams();

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [filteredChildren, setFilteredChildren] = useState<any[]>([]);
  const attendances = useSelector(selectAttendances);
  const [newChild, setNewChild] = useState<NewChild>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    parentId: "",
    groupId: "",
    gender: "",
    monthlyTime: 60,
  }); // State for new child data
  const [editData, setEditData] = useState<NewChild>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    parentId: "",
    groupId: "",
    gender: "",
    monthlyTime: 60,
  }); // State for editing child data
  const [showEditParentForm, setShowEditParentForm] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [editParentData, setEditParentData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    address: "",
    email: "",
  });
  console.log(editData);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const children = useSelector(selectChildren);
  const groups = useSelector(selectGroups);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const additionalParents = useSelector(selectAdditionalParents);

  const sortChildren = () => {
    const sorted = [...filteredChildren].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
    setFilteredChildren(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  // Fetch children when component mounts
  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchGroups());
    dispatch(fetchAttendances());
    dispatch(fetchAdditionalParents())
      .then((result) => console.log("Fetch result:", result))
      .catch((error) => console.log("Fetch error:", error));
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
  // Format date for display
  console.log(additionalParents);
  const [showAddParentForm, setShowAddParentForm] = useState(false);
  const [newParent, setNewParent] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    address: "",
    email: "",
  });

  const handleParentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewParent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // @ts-expect-error
  const handleEditParentClick = (parent) => {
    setEditingParent(parent);
    setEditParentData({
      firstName: parent.firstName,
      lastName: parent.lastName,
      dateOfBirth: parent.dateOfBirth,
      gender: parent.gender,
      phoneNumber: parent.phoneNumber,
      address: parent.address,
      email: parent.email,
    });
    setShowEditParentForm(true);
  };

  // Add this handler for submitting edit
  // @ts-expect-error
  const handleEditParentSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        editAdditionalParent({
          // @ts-expect-error
          id: editingParent._id,
          parentData: editParentData,
        })
      );
      setShowEditParentForm(false);
      setEditingParent(null);
      setNotification({
        show: true,
        message: "Additional parent updated successfully!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update additional parent. Please try again.",
        type: "error",
      });
    }
  };
  const handleAddParentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(
        createAdditionalParent({
          ...newParent,
          // @ts-expect-error
          childId: selectedChild._id,
        })
      );
      setShowAddParentForm(false);
      setNewParent({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        address: "",
        email: "",
      });
      setNotification({
        show: true,
        message: "Additional parent added successfully!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to add additional parent. Please try again.",
        type: "error",
      });
    }
  };
  // @ts-expect-error
  const calculateMonthlyStats = (childId) => {
    const childAttendances = attendances.filter(
      (attendance) => attendance.childId._id === childId
    );

    const totalDays = childAttendances.length;
    const lateDays = childAttendances.filter(
      (attendance) => new Date(attendance.arrivalTime).getHours() >= 8
    ).length;

    const averageArrivalTime =
      childAttendances.reduce((acc, curr) => {
        const arrivalTime = new Date(curr.arrivalTime);
        return acc + arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
      }, 0) / (totalDays || 1);
    const hours = Math.floor(averageArrivalTime / 60);
    const minutes = Math.round(averageArrivalTime % 60);

    // Calculate weekly hours, hours taken, and remaining hours
    const totalMonthHours = childAttendances.reduce(
      (acc, curr) => acc + (curr.monthHours || 0),
      0
    );

    const totalTakenHours = childAttendances.reduce(
      (acc, curr) => acc + (curr.takenHours || 0),
      0
    );

    const remainingHours = totalMonthHours - totalTakenHours;

    return {
      totalDays,
      lateDays,
      averageArrival: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
      totalMonthHours,
      totalTakenHours,
      remainingHours,
    };
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(createChild(newChild));

      setNotification({
        show: true,
        message: "Child created successfully!",
        type: "success",
      });
      setShowForm(false);
      setNewChild({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        parentId: "",
        groupId: "",
        gender: "",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to create child. Please try again.",
        type: "error",
      });
    }
  };
  useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        message: "Failed to create child. Please try again.",
        type: "error",
      });
    }
  }, [error]);
  // Handle form input changes (for both create and edit forms)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (showEditForm) {
      setEditData({
        ...editData,
        [name]: name === "monthlyTime" ? Number(value) : value,
      });
    } else {
      setNewChild({
        ...newChild,
        [name]: name === "monthlyTime" ? Number(value) : value,
      });
    }
  };

  // Handle form submission for creating a new child
  // const handleSubmitCreateForm = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   dispatch(createChild(newChild)); // Dispatch create child action

  //   setShowForm(false); // Hide form after submission
  //   setNewChild({
  //     firstName: "",
  //     lastName: "",
  //     dateOfBirth: "",
  //     parentId: "",
  //     groupId: "",
  //     gender: "",
  //   }); // Reset form state after submission
  // };

  // Handle form submission for editing a child
  const handleSubmitEditForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedChild) {
      try {
        await dispatch(
          editChild({ id: selectedChild._id, updatedData: editData })
        );
        setNotification({
          show: true,
          message: "Child updated successfully!",
          type: "success",
        });
        setShowEditForm(false);
        setSelectedChild(null);
        setEditData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          parentId: "",
          groupId: "",
          gender: "",
        });
      } catch (error) {
        setNotification({
          show: true,
          message: "Failed to update child. Please try again.",
          type: "error",
        });
      }
    }
  };
  useEffect(() => {
    if (children) {
      // @ts-expect-error
      let filteredData = [];
      if (currentUser?.role === "caretaker") {
        filteredData = children.filter(
          (child) => child.groupId.caretakerId === currentUser?._id
        );
      } else if (currentUser?.role === "manager") {
        filteredData = [...children];
      }
      // @ts-expect-error
      setFilteredChildren(filteredData.reverse());
    }
  }, [children, currentUser]);

  // In CreateChildPage.tsx
  useEffect(() => {
    if (childId && children) {
      const child = children.find((child) => child._id === childId);
      if (child) {
        // @ts-expect-error
        setSelectedChild(child);
      }
    }
  }, [childId, children]);

  return (
    <div className="relative min-h-screen p-2 sm:p-6">
      {!error && (
        <Notify
          show={notification.show}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>

      {/* Main Card Container */}
      <div className="flex flex-col lg:flex-row w-full lg:w-3/4 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-16 sm:mt-20 lg:mt-0">
        {/* Left Sidebar - List of Children */}
        <div className="w-full lg:w-1/3 bg-white border-b lg:border-r lg:border-b-0 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
            Children List
          </h2>
          <button
            onClick={sortChildren}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
          >
            Sort {sortOrder === "asc" ? "↓" : "↑"}
          </button>
          <div className="max-h-[300px] lg:max-h-[500px] overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredChildren.length > 0 ? (
              filteredChildren.reverse().map((child) => (
                <div
                  key={child._id}
                  onClick={() => setSelectedChild(child)}
                  className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-200 ${
                    selectedChild?._id === child._id ? "bg-gray-200" : ""
                  }`}
                >
                  {child.firstName} {child.lastName}
                </div>
              ))
            ) : (
              <p>No children found</p>
            )}
          </div>
        </div>

        {/* Right Side - Selected Child Info or Form */}
        <div className="flex flex-col w-full lg:w-2/3 p-4 sm:p-6 lg:p-10 bg-gray-50 overflow-y-auto">
          {!showForm && !showEditForm ? (
            <>
              {selectedChild ? (
                <>
                  <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Left side - Image */}
                    <img
                      src={nonAva}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />

                    {/* Right side - Child Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">
                        {selectedChild.firstName} {selectedChild.lastName}
                      </h2>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>ID:</strong> {selectedChild._id}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Date of Birth:</strong>{" "}
                        {formatDate(selectedChild.dateOfBirth)}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Gender:</strong> {selectedChild.gender}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Parent:</strong>{" "}
                        {selectedChild.parentId.firstName}{" "}
                        {selectedChild.parentId.lastName}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Group:</strong> {selectedChild.groupId.name}
                      </p>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        <strong>Weekly Time:</strong>{" "}
                        {selectedChild.monthlyTime}
                      </p>
                    </div>

                    {/* Edit Icon */}
                    {currentUser?.role === "manager" && (
                      <EditIcon
                        onClick={() => {
                          setShowEditForm(true);
                          setEditData({
                            firstName: selectedChild.firstName,
                            lastName: selectedChild.lastName,
                            dateOfBirth: selectedChild.dateOfBirth,
                            parentId: selectedChild.parentId._id,
                            groupId: selectedChild.groupId._id,
                            gender: selectedChild.gender,
                            monthlyTime: selectedChild.monthlyTime,
                          });
                        }}
                        className="absolute top-0 right-0 text-xl cursor-pointer text-blue-500"
                      />
                    )}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Attendance Summary
                    </h3>
                    {(() => {
                      const stats = calculateMonthlyStats(selectedChild._id);
                      return (
                        <>
                          <div className="flex flex-col gap-2 mt-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-blue-800">
                                Total Days Present
                              </h3>
                              <p className="text-lg font-bold text-blue-600">
                                {stats.totalDays}
                              </p>
                            </div>
                            <div className="bg-red-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-red-800">
                                Late Arrivals
                              </h3>
                              <p className="text-lg font-bold text-red-600">
                                {stats.lateDays}
                              </p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-green-800">
                                Average Arrival
                              </h3>
                              <p className="text-lg font-bold text-green-600">
                                {stats.averageArrival}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-blue-800">
                                Weekly Hours Limit
                              </h3>
                              <p className="text-lg font-bold text-blue-600">
                                {stats.totalMonthHours}h
                              </p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-green-800">
                                Hours Taken
                              </h3>
                              <p className="text-lg font-bold text-green-600">
                                {stats.totalTakenHours.toFixed(1)}h
                              </p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-lg">
                              <h3 className="text-sm font-semibold text-orange-800">
                                Remaining Hours
                              </h3>
                              <p className="text-lg font-bold text-orange-600">
                                {stats.remainingHours.toFixed(1)}h
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {/* Parent Information Section */}
                  <div className="mt-6 sm:mt-8 rounded-lg">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3">
                      Parent Information
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gray-100 p-4 rounded-lg">
                      <img
                        src={nonAva}
                        alt="Parent Profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                      />
                      <div className="text-center sm:text-left">
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          <strong>Name:</strong>{" "}
                          {selectedChild.parentId.firstName}{" "}
                          {selectedChild.parentId.lastName}
                        </p>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          <strong>Email:</strong> {selectedChild.parentId.email}
                        </p>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          <strong>Phone:</strong>{" "}
                          {selectedChild.parentId.phoneNumber}
                        </p>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          <strong>Address:</strong>{" "}
                          {selectedChild.parentId.address}
                        </p>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          <strong>Date of Birth:</strong>{" "}
                          {formatDate(selectedChild.parentId.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </div>{" "}
                  <h4 className="text-md font-semibold mb-2">
                    Additional Parent
                  </h4>
                  {additionalParents
                    .filter((parent) => parent.childId === selectedChild._id)
                    .map((additionalParent) => (
                      <div key={additionalParent._id} className="mt-4">
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gray-100 p-4 rounded-lg">
                          <img
                            src={nonAva}
                            alt="Additional Parent Profile"
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                          />
                          <div className="text-center sm:text-left">
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Name:</strong>{" "}
                              {additionalParent.firstName}{" "}
                              {additionalParent.lastName}
                            </p>
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Email:</strong> {additionalParent.email}
                            </p>
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Phone:</strong>{" "}
                              {additionalParent.phoneNumber}
                            </p>
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Address:</strong>{" "}
                              {additionalParent.address}
                            </p>
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Date of Birth:</strong>{" "}
                              {formatDate(additionalParent.dateOfBirth)}
                            </p>
                            <p className="text-gray-600 mb-2 text-sm sm:text-base">
                              <strong>Gender:</strong> {additionalParent.gender}
                            </p>
                          </div>
                          {currentUser?.role === "manager" && (
                            <EditIcon
                              onClick={() =>
                                handleEditParentClick(additionalParent)
                              }
                              className="absolute top-2 right-2 text-xl cursor-pointer text-blue-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  {/* Edit Additional Parent Form */}
                  {showEditParentForm && (
                    <form
                      onSubmit={handleEditParentSubmit}
                      className="mt-4 space-y-4 bg-white p-6 rounded-lg shadow"
                    >
                      <h4 className="text-lg font-semibold">
                        Edit Additional Parent
                      </h4>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={editParentData.firstName}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={editParentData.lastName}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editParentData.email}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              email: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editParentData.phoneNumber}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editParentData.address}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              address: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={editParentData.dateOfBirth}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={editParentData.gender}
                          onChange={(e) =>
                            setEditParentData({
                              ...editParentData,
                              gender: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-500 text-white py-2 px-6 rounded-full"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditParentForm(false)}
                          className="bg-red-500 text-white py-2 px-6 rounded-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  {selectedChild && currentUser?.role === "manager" && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowAddParentForm(!showAddParentForm)}
                        className="bg-blue-500 text-white py-2 px-6 rounded-full text-sm sm:text-base"
                      >
                        Add Additional Parent
                      </button>

                      {showAddParentForm && (
                        <form
                          onSubmit={handleAddParentSubmit}
                          className="mt-4 space-y-4 bg-white p-6 rounded-lg shadow"
                        >
                          <h4 className="text-lg font-semibold">
                            Add Additional Parent
                          </h4>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={newParent.firstName}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={newParent.lastName}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={newParent.email}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={newParent.phoneNumber}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              name="address"
                              value={newParent.address}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={newParent.dateOfBirth}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Gender
                            </label>
                            <select
                              name="gender"
                              value={newParent.gender}
                              onChange={handleParentInputChange}
                              className="w-full p-2 border rounded"
                              required
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-green-500 text-white py-2 px-6 rounded-full"
                            >
                              Submit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddParentForm(false)}
                              className="bg-red-500 text-white py-2 px-6 rounded-full"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-4">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Select a child to view details
                  </h2>
                </div>
              )}

              {/* Create Child Button */}
              {currentUser?.role === "manager" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-full w-full sm:w-auto"
                >
                  Create Child
                </button>
              )}
            </>
          ) : showEditForm ? (
            /* Edit Child Form */
            <form
              onSubmit={handleSubmitEditForm}
              className="space-y-4 w-full max-w-md mx-auto"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                Edit Child
              </h2>

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
                  value={editData.firstName}
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
                  value={editData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="groupId"
                  className="block text-sm font-medium mb-1"
                >
                  Group
                </label>
                <select
                  id="groupId"
                  name="groupId"
                  value={editData.groupId}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
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
                  value={editData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={editData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Boy</option>
                  <option value="Female">Girl</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="monthlyTime"
                  className="block text-sm font-medium mb-1"
                >
                  Monthly Time (hours)
                </label>
                <input
                  type="number"
                  id="monthlyTime"
                  name="monthlyTime"
                  value={editData.monthlyTime || ""}
                  onChange={handleInputChange}
                  placeholder="Monthly Time"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-6 rounded-full text-sm sm:text-base w-full"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-red-500 text-white py-2 px-6 rounded-full text-sm sm:text-base w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Create Child Form */
            <form
              onSubmit={handleSubmit}
              className="space-y-4 w-full max-w-md mx-auto"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
                Create New Child
              </h2>

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
                  value={newChild.firstName}
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
                  value={newChild.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
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
                  value={newChild.dateOfBirth}
                  onChange={handleInputChange}
                  placeholder="Date of Birth"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="parentId"
                  className="block text-sm font-medium mb-1"
                >
                  Parent ID
                </label>
                <input
                  type="text"
                  id="parentId"
                  name="parentId"
                  value={newChild.parentId}
                  onChange={handleInputChange}
                  placeholder="Parent ID"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="groupId"
                  className="block text-sm font-medium mb-1"
                >
                  Group
                </label>
                <select
                  id="groupId"
                  name="groupId"
                  value={newChild.groupId}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={newChild.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Boy</option>
                  <option value="Female">Girl</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="monthlyTime"
                  className="block text-sm font-medium mb-1"
                >
                  Monthly Time (hours)
                </label>
                <input
                  type="number"
                  id="monthlyTime"
                  name="monthlyTime"
                  value={newChild.monthlyTime || ""}
                  onChange={handleInputChange}
                  placeholder="Monthly Time"
                  className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-6 rounded-full text-sm sm:text-base w-full"
                >
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-500 text-white py-2 px-6 rounded-full text-sm sm:text-base w-full"
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
export default CreateChildPage;
