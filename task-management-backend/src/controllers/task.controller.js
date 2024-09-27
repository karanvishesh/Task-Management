import APIError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import Task from '../models/task.model.js';
import TaskList from '../models/taskList.model.js';
import APIResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, assignedUser, taskList } = req.body;
    const userId = req.user._id;

    if (!dueDate) return res.status(400).json({ message: 'Due Date is required' });
    if (!taskList) return res.status(400).json({ message: 'Task List Id is required' });

    const listExists = await TaskList.findById(taskList);
    if (!listExists) {
      return res.status(404).json({ message: 'Task List not found' });
    }

    // Check if the user has permission to create tasks in this task list
    if (
      listExists.owner.toString() !== userId.toString() &&
      req.user.role !== "Admin" &&
      req.user.role !== "Super Admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to create tasks in this task list" });
    }

    // Create the new task
    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      assignedUser,
      taskList,
    });

    await newTask.save();

    await listExists.addTask(newTask._id);

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const task = await Task.findById(id).populate('taskList');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }


    if (
      task.taskList.owner.toString() !== userId.toString() && 
      req.user.role !== "Admin" && req.user.role !== "Super Admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to update this task" });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskList = await TaskList.findById(task.taskList);
    if (
      taskList.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin" &&
      req.user.role !== "Super Admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to delete this task" });
    }


    await Task.findByIdAndDelete(id);
    await taskList.removeTask(id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getTasksById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate({
      path: 'assignedUser',
      select: '_id fullName email',
    });

    if (!task) {
      return res.status(404).json({ message: 'No task found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignUserToTask = async (req, res) => {
  try {
    const { taskId } = req.params; 
    const { userId } = req.body; 

   
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskList = await TaskList.findById(task.taskList);
    if (
      taskList.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin" &&
      req.user.role !== "Super Admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to assign users to this task" });
    }

    task.assignedUser = userId;
    await task.save();

    res.status(200).json({ message: 'User assigned to task successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unassignUserFromTask = async (req, res) => {
  try {
    const { taskId } = req.params; 


    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskList = await TaskList.findById(task.taskList);
    if (
      taskList.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin" &&
      req.user.role !== "Super Admin"
    ) {
      return res.status(403).json({ message: "You don't have permission to unassign users from this task" });
    }

    task.assignedUser = null;
    await task.save();

    res.status(200).json({ message: 'User unassigned from task successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export {createTask, updateTask, deleteTask, getTasksById, assignUserToTask, unassignUserFromTask}