// import Groups from "../models/groups.mongo";
// import UsersModel from "../models/users.mongo";
import { Request, Response } from "express";
import slugify from "slugify";
import { Groups, Users } from "../models/index";
async function createGroup(req: Request, res: Response) {
  try {
    const { name, description, caretakerId } = req.body;

    if (!name || !description || !caretakerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate if the caretakerId exists in the Users collection
    const caretaker = await Users.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    // Generate the slug from the name
    const slug = slugify(name, { lower: true });

    // Check if a group with the same name or slug already exists
    const existingGroup = await Groups.findOne({ $or: [{ name }, { slug }] });
    if (existingGroup) {
      return res
        .status(409)
        .json({ message: "A group with this name or slug already exists." });
    }

    // Create a new group
    const newGroup = new Groups({
      name,
      description,
      slug,
      caretakerId,
    });

    // Save the group to the database
    const savedGroup = await newGroup.save();
    return res.status(201).json(savedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function getAllGroups(req: Request, res: Response) {
  try {
    const groups = await Groups.find() // Fetch all users
      .populate("caretakerId", "firstName lastName");
    res.status(200).json(groups); // Send all users as JSON
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}

async function getGroupBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    // Find the group by slug
    const group = await Groups.findOne({ slug });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Return the found group
    return res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group by slug:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function editGroup(req: Request, res: Response) {
  try {
    const { id } = req.params; // Get the group ID from request parameters
    const { name, description, caretakerId } = req.body; // Get new name and description from request body

    // Validate input
    if (!name && !description) {
      return res
        .status(400)
        .json({ message: "At least one of name or description is required." });
    }

    // Find the group by ID
    const group = await Groups.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Update the fields if provided
    if (name) {
      group.name = name; // Update name
    }
    if (description) {
      group.description = description; // Update description
    }
    if (caretakerId) {
      const caretaker = await Users.findById(caretakerId);
      if (!caretaker) {
        return res.status(404).json({ message: "Caretaker not found" });
      }
      group.caretakerId = caretakerId;
    }
    // Save the updated group, which will trigger the slug update if name is modified
    const updatedGroup = await group.save();

    return res.status(200).json(updatedGroup); // Return the updated group
  } catch (error) {
    console.error("Error editing group:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
}

export { createGroup, getAllGroups, getGroupBySlug, editGroup };
