import mongoose, { Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    assignedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    taskList: {
      type: Schema.Types.ObjectId,
      ref: 'TaskList',
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
