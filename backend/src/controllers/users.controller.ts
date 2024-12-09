import { Request, Response } from "express";
import bcrypt from "bcrypt";
// import Users from "../models/users.mongo";
import { Users } from "../models/index";
// Function to  create a new user
async function createUser(req: Request, res: Response) {
  try {
    const {
      username,
      password,
      email,
      role,
      dateOfBirth,
      firstName,
      lastName,
      phoneNumber,
      address,
    } = req.body;

    // Check if username or email already exists
    const existingUser = await Users.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the new user (slug will be auto-generated)
    const newUser = new Users({
      username,
      password: hashedPassword,
      email,
      role,
      dateOfBirth,
      firstName,
      lastName,
      phoneNumber,
      address,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Send response with the saved user (excluding the password)
    res.status(201).json({
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      dateOfBirth: savedUser.dateOfBirth,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      slug: savedUser.slug, // Include the generated slug
      phoneNumber: savedUser.phoneNumber,
      address: savedUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
}

async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await Users.find(
      {},
      {
        __v: 0,
      }
    ); // Fetch all users
    res.status(200).json(users); // Send all users as JSON
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}

async function getUserBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const user = await Users.findOne({ slug }); // Find user by slug
    if (user) {
      res.status(200).json(user); // Send the found user as JSON
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
}
import mongoose from "mongoose";

async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Validate if the provided ID is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find user by ID
    const user = await Users.findById(id).exec(); // Use .exec() to execute the query

    if (user) {
      return res.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        slug: user.slug,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
async function editUser(req: Request, res: Response) {
  try {
    const {
      username,
      email,
      password,
      dateOfBirth,
      firstName,
      lastName,
      phoneNumber,
      address,
      role,
    } = req.body;
    const { id } = req.params; // Get user ID from request parameters

    // Find the user by ID
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if they are provided in the request body
    if (username) user.username = username;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (role) {
      // Optional: You can add validation to ensure only valid roles are assigned
      const validRoles = ["caretaker", "parent", "guest", "manager"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }
    // If password is being updated, hash it before saving
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
    }

    // Save the updated user to the database
    const updatedUser = await user.save();

    // Send response with the updated user details (excluding the password)
    res.status(200).json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      dateOfBirth: updatedUser.dateOfBirth,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      slug: updatedUser.slug, // Include the slug if applicable
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
}

export { createUser, getAllUsers, getUserBySlug, editUser, getUserById };
