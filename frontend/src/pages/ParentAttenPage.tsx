import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  fetchAttendances,
  selectAttendances,
  selectLoading,
  selectError,
} from "../store/slices/attendanceSlice";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../store/index";
import api from "../components/api";
interface CurrentUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

const ParentAttenPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const dispatch = useDispatch<AppDispatch>();
  const attendances = useSelector(selectAttendances);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const Calendar: React.FC<{
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    attendances: any[];
    selectedChildId: string;
  }> = ({ selectedMonth, onMonthChange, attendances, selectedChildId }) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const handleNextMonth = () => {
      let nextYear = year;
      let nextMonth = month + 1;

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }

      onMonthChange(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
    };

    const handlePrevMonth = () => {
      let prevYear = year;
      let prevMonth = month - 1;

      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear--;
      }

      onMonthChange(`${prevYear}-${String(prevMonth).padStart(2, "0")}`);
    };
    const getAttendanceStatus = (day: number) => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      return attendances.some(
        (att) =>
          new Date(att.date).toISOString().slice(0, 10) === dateStr &&
          (!selectedChildId || att.childId._id === selectedChildId)
      );
    };

    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const hasAttendance = getAttendanceStatus(day);
            return (
              <div
                key={day}
                className={`p-2 text-center rounded ${
                  hasAttendance
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const filteredAttendances = attendances.filter((attendance) => {
    if (!currentUser) return false;
    const attendanceMonth = new Date(attendance.date).toISOString().slice(0, 7);
    return (
      attendance.childId.parentId === currentUser._id &&
      (!selectedChildId || attendance.childId._id === selectedChildId) &&
      attendanceMonth === selectedMonth
    );
  });

  const handleNoteClick = (childId: string) => {
    navigate(`/comments`, { state: { selectedChildId: childId } });
  };

  const monthAttendances = filteredAttendances.filter((attendance) => {
    const attendanceMonth = new Date(attendance.date).toISOString().slice(0, 7);
    return attendanceMonth === selectedMonth;
  });
  // @ts-expect-error
  const totalDays = monthAttendances.length;
  const totalMonthHours = monthAttendances.reduce(
    (acc, curr) => acc + (curr.monthHours || 0),
    0
  );
  const totalTakenHours = monthAttendances.reduce(
    (acc, curr) => acc + (curr.takenHours || 0),
    0
  );
  const remainingHours = totalMonthHours - totalTakenHours;

  const getUniqueParentChildren = () => {
    const uniqueChildrenMap = new Map();
    attendances.forEach((attendance) => {
      if (attendance.childId.parentId === currentUser?._id) {
        uniqueChildrenMap.set(attendance.childId._id, attendance.childId);
      }
    });
    return Array.from(uniqueChildrenMap.values());
  };

  const parentChildren = getUniqueParentChildren();

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
      dispatch(fetchAttendances());
    }
  }, [dispatch, currentUser]);

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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const calculateMonthlyStats = () => {
    const monthAttendances = filteredAttendances.filter((attendance) => {
      const attendanceMonth = new Date(attendance.date)
        .toISOString()
        .slice(0, 7);
      return attendanceMonth === selectedMonth;
    });

    const totalDays = monthAttendances.length;
    const lateDays = monthAttendances.filter((attendance) => {
      const arrivalTime = new Date(attendance.arrivalTime);
      return arrivalTime.getHours() >= 8;
    }).length;

    const averageArrivalTime =
      monthAttendances.reduce((acc, curr) => {
        const arrivalTime = new Date(curr.arrivalTime);
        return acc + arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
      }, 0) / (totalDays || 1);

    const hours = Math.floor(averageArrivalTime / 60);
    const minutes = Math.round(averageArrivalTime % 60);

    const hoursStats = monthAttendances.reduce(
      (acc, attendance) => {
        acc.totalMonthHours += attendance.monthHours || 0;
        acc.totalTakenHours += attendance.takenHours || 0;
        acc.cumulativeTakenHours = attendance.cumulativeTakenHours || 0;
        return acc;
      },
      {
        totalMonthHours: 0,
        totalTakenHours: 0,
        cumulativeTakenHours: 0,
      }
    );

    return {
      totalDays,
      lateDays,
      averageArrival: `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`,
      ...hoursStats,
      remainingHours: hoursStats.totalMonthHours - hoursStats.totalTakenHours,
    };
  };

  const monthlyStats = calculateMonthlyStats();

  return (
    <div className="relative min-h-screen p-2 sm:p-6">
      <button
        onClick={() => navigate("/")}
        className="top-2 sm:top-4 left-2 sm:left-4 bg-gray-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-full text-sm sm:text-base z-10"
      >
        Back to Home
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-xl md:text-2xl font-bold">
              My Child's Attendance
            </h1>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="border p-2 rounded w-full md:w-auto"
            >
              <option value="">All Children</option>
              {parentChildren.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
          </div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {selectedChildId !== "" && (
              <div className="col-span-full bg-white p-4 rounded-lg shadow">
                <Calendar
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  attendances={attendances}
                  selectedChildId={selectedChildId}
                />
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-blue-800">
                Total Days Present
              </h3>

              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {monthlyStats.totalDays}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-red-800">
                Late Arrivals
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-red-600">
                {monthlyStats.lateDays}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-green-800">
                Average Arrival
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {monthlyStats.averageArrival}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-blue-800">
                Hours Limit
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {totalMonthHours}h
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-green-800">
                Hours Taken
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-green-600">
                {totalTakenHours.toFixed(1)}h
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold text-orange-800">
                Remaining Hours
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-orange-600">
                {remainingHours.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Child
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrival
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departure
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendances
                      .filter((attendance) => {
                        const attendanceMonth = new Date(attendance.date)
                          .toISOString()
                          .slice(0, 7);
                        return attendanceMonth === selectedMonth;
                      })
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((attendance) => {
                        const { formattedTime: arrivalTime, isLate } =
                          formatTimeAndCheckLate(attendance.arrivalTime);
                        const { formattedTime: departureTime } =
                          attendance.departureTime
                            ? formatTimeAndCheckLate(attendance.departureTime)
                            : { formattedTime: "N/A" };

                        return (
                          <tr key={attendance._id} className="hover:bg-gray-50">
                            <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                              {attendance.childId.firstName}{" "}
                              {attendance.childId.lastName}
                            </td>
                            <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                              {formatDateToDDMMYYYY(attendance.date)}
                            </td>
                            <td
                              className={`px-3 md:px-6 py-4 text-sm whitespace-nowrap ${
                                isLate ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {arrivalTime}
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 text-sm whitespace-nowrap">
                              {departureTime}
                            </td>
                            <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                  isLate
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {isLate ? "Late" : "On Time"}
                              </span>
                            </td>
                            <td className="px-3 md:px-6 py-4 text-sm whitespace-nowrap">
                              <button
                                onClick={() =>
                                  handleNoteClick(attendance.childId._id)
                                }
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Notes
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentAttenPage;
