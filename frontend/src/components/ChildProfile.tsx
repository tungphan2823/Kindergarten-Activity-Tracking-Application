import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import avaKid from "../assets/avaKid.png";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAttendances,
  selectAttendances,
} from "../store/slices/attendanceSlice";
import { AppDispatch } from "../store/index";

interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string;
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  gender: string;
}

interface ChildProfileProps {
  child: Child[];
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return "Unknown Date";
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const ChildProfile = ({ child }: ChildProfileProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const attendances = useSelector(selectAttendances);
  const [childAttendanceStatus, setChildAttendanceStatus] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    dispatch(fetchAttendances());
  }, [dispatch]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statuses: { [key: string]: string } = {};

    child.forEach((childItem) => {
      const todayAttendance = attendances.find((attendance) => {
        const attendanceDate = new Date(attendance.date);
        attendanceDate.setHours(0, 0, 0, 0);
        return (
          attendance.childId._id === childItem._id &&
          attendanceDate.getTime() === today.getTime()
        );
      });

      if (!todayAttendance) {
        statuses[childItem._id] = "Absent";
      } else {
        const arrivalTime = new Date(todayAttendance.arrivalTime);
        const hours = arrivalTime.getHours();
        const minutes = arrivalTime.getMinutes();
        const timeInMinutes = hours * 60 + minutes;
        const eightAMInMinutes = 8 * 60;

        if (timeInMinutes < eightAMInMinutes) {
          statuses[childItem._id] = "Early";
        } else if (timeInMinutes === eightAMInMinutes) {
          statuses[childItem._id] = "On Time";
        } else {
          statuses[childItem._id] = "Late";
        }
      }
    });

    setChildAttendanceStatus(statuses);
  }, [attendances, child]);

  const getStatusStyle = (status: string) => {
    const baseStyle =
      "px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap";
    switch (status) {
      case "Early":
        return `${baseStyle} bg-green-100 text-green-800`;
      case "On Time":
        return `${baseStyle} bg-blue-100 text-blue-800`;
      case "Late":
        return `${baseStyle} bg-orange-100 text-orange-800`;
      case "Absent":
        return `${baseStyle} bg-red-100 text-red-800`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <Carousel
      animation="slide"
      navButtonsAlwaysVisible={true}
      indicators={true}
      interval={4000}
      swipe={true}
      className="w-full"
      indicatorContainerProps={{
        style: {
          marginTop: "20px",
          position: "absolute",
          bottom: "10px",
        },
      }}
    >
      {child.map((childItem) => (
        <Paper key={childItem._id} elevation={0}>
          <div className="flex flex-col md:flex-row items-center p-4 md:p-8 md:pl-14 rounded-3xl shadow-md mb-6 bg-yellowOrange">
            <img
              src={avaKid}
              alt="Child Avatar"
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl mb-4 md:mb-0 md:mr-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-x-4 md:gap-y-2 w-full">
              <p className="text-gray-700 font-semibold text-sm md:text-base col-span-1 md:col-span-2 break-all">
                ID: {childItem._id}
              </p>
              <h3 className="text-base md:text-lg text-gray-700 font-semibold col-span-1 md:col-span-2 text-center md:text-left">
                {childItem.firstName} {childItem.lastName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full col-span-1 md:col-span-2">
                <p className="text-gray-600 flex items-center text-sm md:text-base justify-center md:justify-start">
                  <CalendarTodayIcon className="mr-2 text-base md:text-lg" />
                  {formatDate(childItem.dateOfBirth)}
                </p>
                <p className="text-gray-600 flex items-center text-sm md:text-base justify-center md:justify-start">
                  <GroupIcon className="mr-2 text-base md:text-lg" />
                  {childItem.groupId.name}
                </p>
                <p className="text-gray-600 flex items-center text-sm md:text-base justify-center md:justify-start">
                  <PersonIcon className="mr-2 text-base md:text-lg" />
                  {childItem.gender}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <HowToRegIcon className="mr-2 text-base md:text-lg" />
                  <span
                    className={getStatusStyle(
                      childAttendanceStatus[childItem._id]
                    )}
                  >
                    {childAttendanceStatus[childItem._id] || "Loading..."}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Paper>
      ))}
    </Carousel>
  );
};

export default ChildProfile;
