// Importing the Groups model
import { Request, Response } from "express";
import { Users, Groups, Children } from "../models/index";
// Create a new child
async function createChild(req, res) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      parentId,
      groupId,
      gender,
      monthlyTime,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate if the parentId exists in the Users collection
    if (parentId) {
      const parent = await Users.findById(parentId);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
    }

    // Validate if the groupId exists in the Groups collection
    if (groupId) {
      const group = await Groups.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
    }

    // Create a new child with monthlyTime
    const newChild = new Children({
      firstName,
      lastName,
      dateOfBirth,
      parentId,
      groupId,
      gender,
      monthlyTime, // Include monthlyTime here
    });

    // Save the child to the database
    const savedChild = await newChild.save();

    // Send the saved child as the response
    return res.status(201).json(savedChild);
  } catch (error) {
    console.error("Error creating child:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

// Get all children
async function getAllChildren(req: Request, res: Response) {
  try {
    const childrenRecords = await Children.find()
      .populate(
        "parentId",
        "firstName lastName email phoneNumber address dateOfBirth"
      ) // Populate parent details
      .populate("groupId", "name caretakerId");
    // Populate group details

    return res.status(200).json(childrenRecords);
  } catch (error) {
    console.error("Error fetching children records:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
async function getChild(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    const child = await Children.findById(id)
      .populate("parentId", "username") // Populate parent details
      .populate("groupId", "name"); // Populate group details

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    return res.status(200).json(child);
  } catch (error) {
    console.error("Error fetching child details:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function getChildrenByParentId(req: Request, res: Response) {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ message: "Parent ID is required" });
    }

    // Find children with the specified parentId
    const children = await Children.find({ parentId }).populate(
      "groupId",
      "name caretakerId "
    );

    if (children.length === 0) {
      return res
        .status(404)
        .json({ message: "No children found for this parent" });
    }

    return res.status(200).json(children);
  } catch (error) {
    console.error("Error fetching children by parent ID:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function editChild(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, groupId, monthlyTime } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Find the child by ID
    const child = await Children.findById(id);

    // Check if the child exists
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Update only the allowed fields
    if (firstName) child.firstName = firstName;
    if (lastName) child.lastName = lastName;
    if (dateOfBirth) child.dateOfBirth = dateOfBirth;
    if (gender) child.gender = gender;

    if (groupId) {
      const group = await Groups.findById(groupId); // Ensure group exists
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      child.groupId = groupId; // Update groupId
    }

    if (monthlyTime !== undefined) child.monthlyTime = monthlyTime; // Update monthlyTime

    // Save the updated child
    const updatedChild = await child.save();

    // Send the updated child as the response
    return res.status(200).json(updatedChild);
  } catch (error) {
    console.error("Error updating child details:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
export {
  createChild,
  getAllChildren,
  getChild,
  editChild,
  getChildrenByParentId,
};
