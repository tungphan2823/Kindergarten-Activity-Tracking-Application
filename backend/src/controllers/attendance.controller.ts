import Attendances from "../models/attendances.mongo";

import { Children, Users } from "../models/index";
import { Request, Response } from "express";

// Create a new attendance record
// async function createAttendance(req: Request, res: Response) {
//   try {
//     const { childId, date, arrivalTime, departureTime, caretakerId } = req.body;

//     // Validate required fields
//     if (!childId || !date || !arrivalTime || !caretakerId) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Validate if the childId exists in the Children collection
//     const child = await Children.findById(childId);
//     if (!child) {
//       return res.status(404).json({ message: "Child not found" });
//     }

//     // Validate if the caretakerId exists in the Users collection
//     const caretaker = await Users.findById(caretakerId);
//     if (!caretaker) {
//       return res.status(404).json({ message: "Caretaker not found" });
//     }

//     // Create a new attendance record
//     const newAttendance = new Attendances({
//       childId,
//       date,
//       arrivalTime,
//       departureTime,
//       caretakerId,
//     });

//     // Save the attendance record to the database
//     const savedAttendance = await newAttendance.save();

//     // Send the saved attendance record as the response
//     return res.status(201).json(savedAttendance);
//   } catch (error) {
//     console.error("Error creating attendance:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// }
async function createAttendance(req: Request, res: Response) {
  try {
    const {
      childId,
      date,
      arrivalTime,
      departureTime,
      caretakerId,
      monthHours,
    } = req.body;

    if (!childId || !date || !arrivalTime || !caretakerId || !monthHours) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (monthHours <= 0) {
      return res
        .status(400)
        .json({ message: "Month hours must be a positive number" });
    }

    const child = await Children.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const caretaker = await Users.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    // If departureTime exists, validate it
    if (departureTime && new Date(departureTime) <= new Date(arrivalTime)) {
      return res.status(400).json({
        message: "Departure time must be later than arrival time",
      });
    }

    const newAttendance = new Attendances({
      childId,
      date,
      arrivalTime,
      departureTime,
      caretakerId,
      monthHours,
    });

    const savedAttendance = await newAttendance.save();
    return res.status(201).json(savedAttendance);
  } catch (error) {
    console.error("Error creating attendance:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function updateAttendance(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { departureTime, monthHours } = req.body;

    const attendanceRecord = await Attendances.findById(id);
    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    if (departureTime) {
      if (new Date(departureTime) <= new Date(attendanceRecord.arrivalTime)) {
        return res.status(400).json({
          message: "Departure time must be later than arrival time",
        });
      }
      attendanceRecord.departureTime = departureTime;
    }

    if (monthHours) {
      if (monthHours <= 0) {
        return res.status(400).json({
          message: "Month hours must be a positive number",
        });
      }
      attendanceRecord.monthHours = monthHours;
    }

    const updatedAttendance = await attendanceRecord.save();
    return res.status(200).json(updatedAttendance);
  } catch (error) {
    console.error("Error updating attendance record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
// Get all attendance records
async function getAllAttendance(req: Request, res: Response) {
  try {
    const attendanceRecords = await Attendances.find()
      .populate("childId", "firstName lastName groupId parentId") // Populate child details
      .populate("caretakerId", "username"); // Populate caretaker details

    return res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
// Get a single attendance record by _id
async function getAttendanceById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const attendanceRecord = await Attendances.findById(id)
      .populate("childId", "firstName lastName") // Populate child details
      .populate("caretakerId", "username"); // Populate caretaker details

    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Return the attendance record
    return res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

// async function updateAttendance(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     const { departureTime } = req.body;

//     // Fetch the existing attendance record
//     const attendanceRecord = await Attendances.findById(id);

//     if (!attendanceRecord) {
//       return res.status(404).json({ message: "Attendance record not found" });
//     }

//     if (departureTime) {
//       if (new Date(departureTime) <= new Date(attendanceRecord.arrivalTime)) {
//         return res
//           .status(400)
//           .json({ message: "Departure time must be later than arrival time" });
//       }

//       attendanceRecord.departureTime = departureTime;
//     }

//     const updatedAttendance = await attendanceRecord.save();

//     return res.status(200).json(updatedAttendance);
//   } catch (error) {
//     console.error("Error updating attendance record:", error);
//     return res.status(500).json({ message: "Server error", error });
//   }
// }

export {
  createAttendance,
  getAllAttendance,
  getAttendanceById,
  updateAttendance,
};
