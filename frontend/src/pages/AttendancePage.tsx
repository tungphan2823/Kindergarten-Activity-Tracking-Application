import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import nonAva from "../assets/nonAva.jpg";
import api from "../components/api";
import PresentChildrenCarousel from "../components/PresentChildrenCarousel";
import {
  fetchAttendances,
  selectAttendances,
  selectLoading,
  selectError,
  createAttendance,
  updateAttendance,
} from "../store/slices/attendanceSlice";
import { fetchGroups, selectGroups } from "../store/slices/groupSlice";
import { useNavigate } from "react-router-dom";
import Notify from "../components/NotifyProps";
import { fetchChildren, selectChildren } from "../store/slices/childrenSlice";
import { AppDispatch } from "../store/index";
interface CurrentUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}
const AttendancePage: React.FC = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const handleNoteClick = (childId: string) => {
    navigate(`/comments`, { state: { selectedChildId: childId } });
  };
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Default to today
  );
  const dispatch = useDispatch<AppDispatch>();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    childId: "",
    date: "",
    arrivalTime: "",
    departureTime: "",
    caretakerId: "",
    monthHours: 60, 
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    childId: "",
    date: "",
    arrivalTime: "",
    departureTime: "",
    caretakerId: "",
    monthHours: 60, 
  });
  const attendances = useSelector(selectAttendances);

  const groups = useSelector(selectGroups);
  const children = useSelector(selectChildren);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filteredGroups = groups.filter((group) => {
    // Debug the group's caretakerId structure
    return group.caretakerId && group.caretakerId._id === currentUser?._id;
  });
  console.log(attendances);
  // Add console logs to debug the filtering
  // console.log("All Groups:", groups);
  // console.log("Filtered Groups:", filteredGroups);
  // console.log("Current User:", currentUser);

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

  const handleEditClick = (attendance: any) => {
    const arrivalTime = new Date(attendance.arrivalTime).toLocaleTimeString(
      "en-GB",
      { hour: "2-digit", minute: "2-digit", hour12: false }
    );

    const departureTime = attendance.departureTime
      ? new Date(attendance.departureTime).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "";

    setEditFormData({
      _id: attendance._id,
      childId: attendance.childId._id,
      date: new Date(attendance.date).toISOString().split("T")[0],
      arrivalTime: arrivalTime,
      departureTime: departureTime,
      caretakerId: attendance.caretakerId._id,
      monthHours: attendance.monthHours || 45,
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const combinedArrivalTime = new Date(
      `${editFormData.date}T${editFormData.arrivalTime}:00`
    );
    const combinedDepartureTime = editFormData.departureTime
      ? new Date(`${editFormData.date}T${editFormData.departureTime}:00`)
      : null;

    const payload = {
      childId: { _id: editFormData.childId },
      date: editFormData.date,
      arrivalTime: combinedArrivalTime,
      departureTime: combinedDepartureTime,
      caretakerId: { _id: currentUser._id },
      monthHours: Number(editFormData.monthHours),
    };
    try {
      await dispatch(
        updateAttendance({
          id: editFormData._id,
          // @ts-ignore
          updatedData: payload,
        })
      );
      setNotification({
        show: true,
        message: "Attendance updated successfully!",
        type: "success",
      });
      setIsEditModalOpen(false);
      setEditFormData({
        _id: "",
        childId: "",
        date: "",
        arrivalTime: "",
        departureTime: "",
        caretakerId: "",
        monthHours: 45,
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update attendance. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchGroups());
      dispatch(fetchAttendances());
      dispatch(fetchChildren());
    }
  }, [dispatch, currentUser]);

  const filteredAttendances = attendances
    .filter((attendance) => {
      // First check if the attendance belongs to the current caretaker
      if (currentUser && attendance.caretakerId._id !== currentUser._id) {
        return false;
      }

      // Then apply group filter
      if (selectedGroup && attendance.childId.groupId !== selectedGroup) {
        return false;
      }

      // Then apply date filter
      if (selectedDate) {
        const attendanceDate = new Date(attendance.date);
        const filterDate = new Date(selectedDate);

        attendanceDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);

        return attendanceDate.getTime() === filterDate.getTime();
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const formatTimeAndCheckLate = (timeString: string) => {
    const date = new Date(timeString);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const isLate = date.getHours() >= 8;
    return { formattedTime, isLate };
  };

  const formatDateToDDMMYYYY = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const caretakerGroupIds = filteredGroups.map((group) => group._id);

  // Filter children based on caretaker's groups
  const filteredChildren = children.filter((child) =>
    caretakerGroupIds.includes(child.groupId._id)
  );

  // Modify the calculateAttendanceSummary function to use filtered children
  const calculateAttendanceSummary = () => {
    // Get the selected date at midnight for comparison
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(0, 0, 0, 0);

    // Get all group IDs that belong to the current caretaker
    const caretakerGroupIds = groups
      .filter((group) => group.caretakerId._id === currentUser?._id)
      .map((group) => group._id);

    // Filter children based on caretaker's groups and selected group
    const groupChildren = children.filter((child) => {
      // First check if child belongs to any of the caretaker's groups
      const belongsToCaretaker = caretakerGroupIds.includes(child.groupId._id);
      if (!belongsToCaretaker) return false;

      // Then apply selected group filter if any
      return selectedGroup ? child.groupId._id === selectedGroup : true;
    });

    // Get selected date's attendances for filtered children
    const dateAttendances = filteredAttendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === selectedDateTime.getTime();
    });

    // Get present children (including late arrivals)
    const presentChildrenIds = new Set(
      dateAttendances.map((a) => a.childId._id)
    );

    // Get absent children (those who haven't attended on the selected date)
    const absentChildren = groupChildren.filter(
      (child) => !presentChildrenIds.has(child._id)
    );

    // Calculate arrival status
    const arrivalStatus = dateAttendances.reduce(
      (summary, attendance) => {
        const arrivalTime = new Date(attendance.arrivalTime);
        const hours = arrivalTime.getHours();
        const minutes = arrivalTime.getMinutes();
        const timeInMinutes = hours * 60 + minutes;
        const eightAMInMinutes = 8 * 60;

        if (timeInMinutes < eightAMInMinutes) {
          summary.early += 1;
        } else if (timeInMinutes === eightAMInMinutes) {
          summary.onTime += 1;
        } else {
          summary.late += 1;
        }
        return summary;
      },
      { early: 0, onTime: 0, late: 0 }
    );

    return {
      totalChildren: groupChildren.length,
      presentCount: presentChildrenIds.size,
      absentCount: groupChildren.length - presentChildrenIds.size,
      absentChildren,
      ...arrivalStatus,
    };
  };

  // Modify the form submit to validate child belongs to caretaker's groups
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if the child belongs to one of the caretaker's groups
    const childExists = filteredChildren.some(
      (child) => child._id === formData.childId
    );
    if (!childExists) {
      setNotification({
        show: true,
        message: "This child does not belong to any of your groups",
        type: "error",
      });
      return;
    }

    const combinedArrivalTime = new Date(
      `${formData.date}T${formData.arrivalTime}:00`
    );
    const combinedDepartureTime = formData.departureTime
      ? new Date(`${formData.date}T${formData.departureTime}:00`)
      : null;

    const payload = {
      childId: { _id: formData.childId },
      date: formData.date,
      arrivalTime: combinedArrivalTime,
      departureTime: combinedDepartureTime,
      caretakerId: { _id: currentUser._id },
      monthHours: Number(formData.monthHours),
    };

    try {
      // @ts-ignore
      await dispatch(createAttendance(payload));
      setNotification({
        show: true,
        message: "Attendance created successfully!",
        type: "success",
      });
      setIsModalOpen(false);
      setFormData({
        childId: "",
        date: "",
        arrivalTime: "",
        departureTime: "",
        caretakerId: "",
        monthHours: 45,
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to create attendance. Please try again.",
        type: "error",
      });
    }
  };
  const { absentChildren } = calculateAttendanceSummary();
  const summary = calculateAttendanceSummary();
  const handleChildClick = (childId: string) => {
    navigate(`/child/${childId}`);
  };
  return (
    <div className=" relative min-h-screen p-2 sm:p-6">
      <Notify
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <button
        onClick={() => navigate("/")}
        className=" top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Attendance</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border p-2 rounded w-full sm:w-auto"
              />
              <select
                value={selectedGroup || ""}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="border p-2 rounded w-full sm:w-auto"
              >
                <option value="">All Groups</option>
                {filteredGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Add Attendance
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex flex-wrap p-2 sm:p-4 bg-gray-50">
          {/* Summary Section */}
          <div className="w-full lg:w-1/2 p-2">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg h-full border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold mb-6 text-gray-800 border-b pb-2">
                Today's Attendance Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <p className="text-blue-600 font-semibold mb-2">
                      Total Children
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                      {summary.totalChildren}
                    </p>
                    <p className="text-sm text-blue-500 mt-1">Registered</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <p className="text-green-600 font-semibold mb-2">Present</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">
                      {summary.presentCount}
                    </p>
                    <p className="text-sm text-green-500 mt-1">
                      {Math.round(
                        (summary.presentCount / summary.totalChildren) * 100
                      )}
                      %
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    <p className="text-orange-600 font-semibold mb-2">Absent</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-700">
                      {summary.absentCount}
                    </p>
                    <p className="text-sm text-orange-500 mt-1">
                      {Math.round(
                        (summary.absentCount / summary.totalChildren) * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Present Children Carousel Section */}
          <div className="w-full lg:w-1/2 p-2">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg h-full">
              <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center">
                <span className="bg-green-100 p-2 rounded-lg mr-3">👋</span>
                Present Children
              </h2>
              <PresentChildrenCarousel
                attendances={filteredAttendances.filter(
                  (attendance) =>
                    new Date(attendance.date).toDateString() ===
                    new Date(selectedDate).toDateString()
                )}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-2 sm:p-4 overflow-x-auto">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Child Name
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Date
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Arrival Time
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Leaving Time
                    </th>
                    {/* <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Status
                    </th> */}
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Weekly Hours
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Taken Hours
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Cumulative Hours
                    </th>

                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Note
                    </th>
                    <th className="py-2 px-3 text-left border-b-2 text-sm sm:text-base">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendances.map((attendance) => {
                    const { formattedTime, isLate } = formatTimeAndCheckLate(
                      attendance.arrivalTime
                    );
                    return (
                      <tr
                        key={attendance._id}
                        className="border-t hover:bg-gray-100"
                      >
                        <td className="p-2 sm:p-3">
                          <div className="flex items-center">
                            <img
                              src={nonAva}
                              alt="Profile"
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3"
                            />
                            <div
                              onClick={() =>
                                handleChildClick(attendance.childId._id)
                              }
                              className="cursor cursor:pointer"
                            >
                              <p className="text-sm sm:text-base">
                                {attendance.childId.firstName}{" "}
                                {attendance.childId.lastName}
                              </p>
                              <p className="text-[10px] sm:text-sm pr-8 text-gray-500">
                                {attendance.childId._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base">
                          {formatDateToDDMMYYYY(attendance.date)}
                        </td>
                        <td
                          className={`p-2 sm:p-3 ${
                            isLate
                              ? "text-rose-400 font-semibold"
                              : "text-green-600 font-semibold"
                          } text-sm sm:text-base`}
                        >
                          {formattedTime}
                        </td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base ">
                          {attendance.departureTime
                            ? formatTimeAndCheckLate(attendance.departureTime)
                                .formattedTime
                            : "N/A"}
                        </td>
                        {/* <td className="p-2 sm:p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${
                              isLate
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isLate ? "Late" : "On Time"}
                          </span>
                        </td> */}
                        <td className="p-2 sm:p-3 text-sm sm:text-base">
                          <span className="px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {attendance.monthHours} hrs
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base ">
                          <span className="px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {attendance.takenHours.toFixed(2)} hrs
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-sm sm:text-base">
                          <span className="px-2 py-1 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {attendance.cumulativeTakenHours.toFixed(2)} hrs
                          </span>
                        </td>

                        <td className="p-2 sm:p-3">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                            onClick={() =>
                              handleNoteClick(attendance.childId._id)
                            }
                          >
                            Note
                          </button>
                        </td>
                        <td className="p-2 sm:p-3">
                          <button
                            onClick={() => handleEditClick(attendance)}
                            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Absent Children Section */}
                  <tr>
                    <td colSpan={7} className="p-2 sm:p-4">
                      <h2 className="text-xl sm:text-2xl font-bold">Absent</h2>
                    </td>
                  </tr>
                  {absentChildren.map((child) => (
                    <tr
                      key={child._id}
                      className="border-t hover:bg-gray-100  "
                    >
                      <td className="p-2 sm:p-3">
                        <div className="flex items-center">
                          <img
                            src={nonAva}
                            alt="Profile"
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3"
                          />
                          <div>
                            <p className="text-sm sm:text-base">
                              {child.firstName} {child.lastName}
                            </p>
                            <p className="text-[10px] sm:text-sm  pr-8 text-gray-500">
                              {child._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 text-red-500 text-sm sm:text-base">
                        Absent
                      </td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base">-</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base">-</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base">-</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base">-</td>
                      <td className="p-2 sm:p-3 text-sm sm:text-base">
                        {formatDateToDDMMYYYY(new Date().toISOString())}
                      </td>

                      <td className="p-2 sm:p-3 text-sm sm:text-base">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Attendance Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Attendance</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="childId" className="block mb-2">
                    Child:
                  </label>
                  <select
                    id="childId"
                    name="childId"
                    value={formData.childId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        childId: e.target.value,
                      }))
                    }
                    required
                    className="border p-2 w-full rounded"
                  >
                    <option value="">Select a child</option>
                    {filteredChildren.map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.firstName} {child.lastName} - Group:{" "}
                        {child.groupId.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="monthHours" className="block mb-2">
                    Weekly Hours:
                  </label>
                  <input
                    type="number"
                    id="monthHours"
                    name="monthHours"
                    value={formData.monthHours}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="border p-2 w-full rounded"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block mb-2">
                    Date:
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label htmlFor="arrivalTime" className="block mb-2">
                    Arrival Time:
                  </label>
                  <input
                    type="time"
                    id="arrivalTime"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    required
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label htmlFor="departureTime" className="block mb-2">
                    Departure Time:
                  </label>
                  <input
                    type="time"
                    id="departureTime"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    Submit Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Attendance Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Attendance</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-date" className="block mb-2">
                    Date:
                  </label>
                  <input
                    type="date"
                    id="edit-date"
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    required
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label htmlFor="edit-arrivalTime" className="block mb-2">
                    Arrival Time:
                  </label>
                  <input
                    type="time"
                    id="edit-arrivalTime"
                    value={editFormData.arrivalTime}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        arrivalTime: e.target.value,
                      }))
                    }
                    required
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div>
                  <label htmlFor="edit-departureTime" className="block mb-2">
                    Departure Time:
                  </label>
                  <input
                    type="time"
                    id="edit-departureTime"
                    value={editFormData.departureTime}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        departureTime: e.target.value,
                      }))
                    }
                    className="border p-2 w-full rounded"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    Update Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
