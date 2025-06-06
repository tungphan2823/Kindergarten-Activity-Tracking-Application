import { Request, Response } from "express";
import { AdditionalParent } from "../models/index";
import mongoose from "mongoose";

async function createAdditionalParent(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      email,
      childId,
    } = req.body;

    
    const existingParent = await AdditionalParent.findOne({ email });
    if (existingParent) {
      return res.status(400).json({ message: "Email already exists" });
    }

    
    const newAdditionalParent = new AdditionalParent({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      email,
      childId,
    });

    
    const savedParent = await newAdditionalParent.save();

    res.status(201).json(savedParent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating additional parent", error });
  }
}

async function getAllAdditionalParents(req: Request, res: Response) {
  try {
    const parents = await AdditionalParent.find({}, { __v: 0 });
    res.status(200).json(parents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching additional parents", error });
  }
}

async function getAdditionalParentById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parent ID" });
    }

    const parent = await AdditionalParent.findById(id).exec();

    if (parent) {
      return res.status(200).json(parent);
    } else {
      return res.status(404).json({ message: "Additional parent not found" });
    }
  } catch (error) {
    console.error("Error fetching additional parent by ID:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function editAdditionalParent(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      email,
      childId,
    } = req.body;
    const { id } = req.params;

    const parent = await AdditionalParent.findById(id);
    if (!parent) {
      return res.status(404).json({ message: "Additional parent not found" });
    }

    
    if (firstName) parent.firstName = firstName;
    if (lastName) parent.lastName = lastName;
    if (dateOfBirth) parent.dateOfBirth = dateOfBirth;
    if (gender) parent.gender = gender;
    if (phoneNumber) parent.phoneNumber = phoneNumber;
    if (address) parent.address = address;
    if (email) parent.email = email;
    if (childId) parent.childId = childId;

    
    const updatedParent = await parent.save();

    res.status(200).json(updatedParent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating additional parent", error });
  }
}

async function deleteAdditionalParent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parent ID" });
    }

    const deletedParent = await AdditionalParent.findByIdAndDelete(id);

    if (deletedParent) {
      return res
        .status(200)
        .json({ message: "Additional parent deleted successfully" });
    } else {
      return res.status(404).json({ message: "Additional parent not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting additional parent", error });
  }
}

export {
  createAdditionalParent,
  getAllAdditionalParents,
  getAdditionalParentById,
  editAdditionalParent,
  deleteAdditionalParent,
};
