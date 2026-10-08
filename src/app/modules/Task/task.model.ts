import { Schema, model } from "mongoose";
import { ITask, TaskInterface } from "./task.interface";

const checklistItemSchema = new Schema(
  {
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    isMandatory: { type: Boolean, default: true },
  },
  { _id: true }
);

const taskSchema = new Schema<ITask, TaskInterface>(
  {
    taskId: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    instructions: { type: String },
    
    type: {
      type: String,
      enum: ["general", "nfc_linked", "cleaning", "security_check"],
      default: "general",
    },
    
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "submitted", "approved", "rejected", "returned", "overdue"],
      default: "assigned",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekdays", "weekly", "monthly"],
      default: "none",
    },
    
    dueDate: { type: Date },
    completedAt: { type: Date },
    
    checklist: [checklistItemSchema],
    checklistProgress: { type: Number, default: 0 },
    
    requiresEvidence: { type: Boolean, default: false },
    attachments: [
      {
        fileUrl: { type: String, required: true },
        type: { type: String, enum: ["photo", "video", "file"], required: true },
      }
    ],
    completionNotes: { type: String },
    
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

taskSchema.statics.generateTaskId = async function () {
  const latestTask = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestTask && latestTask.taskId) {
    const idParts = latestTask.taskId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `TSK-${nextId}`;
};

taskSchema.pre("save", async function () {
  if (!this.taskId) {
    this.taskId = await (this.constructor as any).generateTaskId();
  }
  if (this.checklist && this.checklist.length > 0) {
    const completedCount = this.checklist.filter(c => c.isCompleted).length;
    this.checklistProgress = Math.round((completedCount / this.checklist.length) * 100);
  }
});

export const TaskModel = model<ITask, TaskInterface>("Task", taskSchema);
