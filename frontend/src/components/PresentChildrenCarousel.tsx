
import React from "react";
import Carousel from "react-material-ui-carousel";
import { Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import nonAva from "../assets/nonAva.jpg";

interface PresentChildrenCarouselProps {
  attendances: any[];
}

const PresentChildrenCarousel: React.FC<PresentChildrenCarouselProps> = ({ attendances }) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Carousel
      animation="slide"
      navButtonsAlwaysVisible={true}
      indicators={true}
      interval={4000}
      swipe={true}
      className="w-full h-full"
      indicatorContainerProps={{
        style: {
          marginTop: "20px",
          position: "absolute",
          bottom: "10px",
        },
      }}
    >
      {attendances.map((attendance) => (
        <Paper key={attendance._id} elevation={0}>
          <div className="flex flex-col items-center p-4 rounded-xl shadow-md bg-yellowOrange h-full">
            <img
              src={nonAva}
              alt="Child Avatar"
              className="w-16 h-16 rounded-full mb-3"
            />
            <div className="text-center w-full">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {attendance.childId.firstName} {attendance.childId.lastName}
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 flex items-center justify-center text-sm">
                  <GroupIcon className="mr-2 text-base" />
                  {attendance.childId.groupId.name}
                </p>
                <p className="text-gray-600 flex items-center justify-center text-sm">
                  <AccessTimeIcon className="mr-2 text-base" />
                  {formatTime(attendance.arrivalTime)}
                </p>
                <p className="text-gray-600 flex items-center justify-center text-sm">
                  <PersonIcon className="mr-2 text-base" />
                  {attendance.takenHours ? `${attendance.takenHours.toFixed(1)} hours` : 'Present'}
                </p>
              </div>
            </div>
          </div>
        </Paper>
      ))}
    </Carousel>
  );
};

export default PresentChildrenCarousel;