import { Request, Response } from "express";
import { Comments, Users, Children } from "../models";

async function createComment(req: Request, res: Response) {
  try {
    const { childId, caretakerId, content, rating } = req.body;

    // Check if required fields are provided
    if (!childId || !caretakerId || !content || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate if rating is within range (1-5)
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    // Validate if childId exists in the Children collection
    const child = await Children.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Validate if caretakerId exists in the Users collection
    const caretaker = await Users.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    // Create a new comment with rating
    const newComment = new Comments({
      childId,
      caretakerId,
      content,
      rating, // Add rating to the comment
    });

    // Save the comment to the database
    const savedComment = await newComment.save();

    // Send the saved comment as the response
    return res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
// Get all comments
async function getAllComments(req: Request, res: Response) {
  try {
    // Retrieve all comments, with the child and caretaker details populated
    const comments = await Comments.find()
      .populate("childId", "firstName lastName groupId parentId")
      .populate("caretakerId", "firstName lastName ");

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
async function editComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params; // Get comment ID from request params
    const { content, rating } = req.body; // Get updated content and rating from request body

    // Check if required fields are provided
    if (!content || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate that rating is between 1 and 5
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    // Find the comment by ID and update it with new content and rating
    const updatedComment = await Comments.findByIdAndUpdate(
      commentId,
      { content, rating },
      { new: true } // Return the updated document
    );

    // If no comment is found, return a 404 error
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Return the updated comment as the response
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
export { createComment, getAllComments, editComment };
