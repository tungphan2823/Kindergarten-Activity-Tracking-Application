import { Request, Response } from "express";
import { Events } from "../models/index";
import mongoose from "mongoose";

async function createEvent(req: Request, res: Response) {
  try {
    const { name, description, startDate, endDate, groups } = req.body;

    
    const newEvent = new Events({
      name,
      description,
      startDate,
      endDate,
      groups,
    });

    
    const savedEvent = await newEvent.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error });
  }
}

async function getAllEvents(req: Request, res: Response) {
  try {
    const events = await Events.find({});

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
}

async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Events.findById(id).populate("groups").exec();

    if (event) {
      return res.status(200).json(event);
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching event", error });
  }
}

async function editEvent(req: Request, res: Response) {
  try {
    const { name, description, startDate, endDate, groups } = req.body;
    const { id } = req.params;

    const event = await Events.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    
    if (name) event.name = name;
    if (description) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (groups) event.groups = groups;

    
    const updatedEvent = await event.save();

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error });
  }
}

async function deleteEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const deletedEvent = await Events.findByIdAndDelete(id);

    if (deletedEvent) {
      return res.status(200).json({ message: "Event deleted successfully" });
    } else {
      return res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error deleting event", error });
  }
}

export { createEvent, getAllEvents, getEventById, editEvent, deleteEvent };
