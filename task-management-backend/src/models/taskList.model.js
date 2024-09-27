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

taskListSchema.methods.addTask = async function(taskId) {
  this.tasks.push(taskId);
  return await this.save();
};

taskListSchema.methods.removeTask = async function(taskId) {
  this.tasks.pull(taskId);
  return await this.save();
};

const TaskList = mongoose.model('TaskList', taskListSchema);

export default TaskList;
