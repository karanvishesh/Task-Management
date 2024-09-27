import mongoose, { Schema } from 'mongoose';

const taskListSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tasks: [{
      type: Schema.Types.ObjectId,
      ref: 'Task', 
    }],
  },
  { timestamps: true }
);

const TaskList = mongoose.model('TaskList', taskListSchema);

export default TaskList;
