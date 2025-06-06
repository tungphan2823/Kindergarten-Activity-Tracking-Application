import { Request, Response } from "express";
import { Comments, Users, Children } from "../models";

async function createComment(req: Request, res: Response) {
  try {
    const { childId, caretakerId, content, rating } = req.body;

    
    if (!childId || !caretakerId || !content || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    
    const child = await Children.findById(childId);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    
    const caretaker = await Users.findById(caretakerId);
    if (!caretaker) {
      return res.status(404).json({ message: "Caretaker not found" });
    }

    
    const newComment = new Comments({
      childId,
      caretakerId,
      content,
      rating, 
    });

    
    const savedComment = await newComment.save();

    
    return res.status(201).json(savedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}

async function getAllComments(req: Request, res: Response) {
  try {
    
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
    const { commentId } = req.params; 
    const { content, rating } = req.body; 

    
    if (!content || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    
    const updatedComment = await Comments.findByIdAndUpdate(
      commentId,
      { content, rating },
      { new: true } 
    );

    
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ message: "Server error", error });
  }
}
export { createComment, getAllComments, editComment };
