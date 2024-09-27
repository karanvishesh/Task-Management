import APIError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import Task from "../models/task.model.js";
import TaskList from "../models/taskList.model.js";
import mongoose from "mongoose";
import APIResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const createTaskList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    const newTaskList = new TaskList({
      name,
      owner: new mongoose.Types.ObjectId(userId),
    });

    const savedTaskList = await newTaskList.save();
    res.status(201).json(savedTaskList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserTaskLists = async (req, res) => {
  try {
    const userId = req.user._id;

    const createdTaskLists = await TaskList.find({ owner: userId }).populate({
      path: "owner",
      select: "_id fullName email",
    });

    const assignedTasks = await Task.find({ assignedUser: userId }).populate(
      "taskList"
    );

    const assignedTaskLists = assignedTasks.map((task) => task.taskList);

    const allTaskLists = [
      ...new Set([...createdTaskLists, ...assignedTaskLists]),
    ];

    res.status(200).json(allTaskLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTaskListsForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const taskLists = await TaskList.find().populate({
      path: "owner",
      select: "_id fullName email",
    });

    res.status(200).json(taskLists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTaskListById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskList = await TaskList.findById(id).populate({
      path: "owner",
      select: "_id fullName email",
    });

    if (!taskList) {
      return res.status(404).json({ message: "Task List not found" });
    }
    console.log(taskList.owner._id);
    console.log(req.user._id);

    if (
      req.user.role == "Super Admin" ||
      req.user.role == "Admin" ||
      taskList.owner._id.equals(req.user._id)
    )
      res.status(200).json(taskList);
    else res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskList = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const taskList = await TaskList.findOne({ _id: id });

    if (!taskList) {
      return res.status(404).json({ message: "Task List not found" });
    }

    if (
      taskList.owner.toString() !== userId.toString() &&
      userRole !== "Admin" &&
      userRole !== "SuperAdmin"
    ) {
      return res.status(403).json({
        message: "You do not have permission to update this task list",
      });
    }

    const updatedTaskList = await TaskList.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate({
      path: "owner",
      select: "_id fullName email",
    });

    res.status(200).json(updatedTaskList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTaskList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const taskList = await TaskList.findOne({ _id: id });

    if (!taskList) {
      return res.status(404).json({ message: "Task List not found" });
    }

    if (
      taskList.owner.toString() !== userId.toString() &&
      userRole !== "Admin" &&
      userRole !== "SuperAdmin"
    ) {
      return res.status(403).json({
        message: "You do not have permission to delete this task list",
      });
    }

    await TaskList.findByIdAndDelete(id);

    res.status(200).json({ message: "Task List deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export {
  createTaskList,
  getUserTaskLists,
  getAllTaskListsForAdmin,
  getTaskListById,
  updateTaskList,
  deleteTaskList,
};
