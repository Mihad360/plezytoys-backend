import { Schema, model } from "mongoose";
import { IPatrolExecution, PatrolExecutionInterface } from "./patrolExecution.interface";

const verificationDataSchema = new Schema(
  {
    gpsLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      isVerified: { type: Boolean, default: true },
    },
    nfcVerified: { type: Boolean, default: true },
    nfcUid: { type: String },
    originalTimestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const executionCheckpointSchema = new Schema(
  {
    checkpoint: { type: Schema.Types.ObjectId, ref: "NfcCheckpoint", required: true },
    scannedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "scanned", "missed"],
      default: "pending",
    },
    notes: { type: String },
    missedReason: { type: String },
    photoUrl: { type: String },
    verificationData: { type: verificationDataSchema },
  },
  { _id: false }
);

const patrolExecutionSchema = new Schema<IPatrolExecution, PatrolExecutionInterface>(
  {
    executionId: { type: String, unique: true },
    route: { type: Schema.Types.ObjectId, ref: "PatrolRoute", required: true },
    executedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    
    status: {
      type: String,
      enum: ["in_progress", "completed", "incomplete", "abandoned"],
      default: "in_progress",
    },
    
    checkpoints: [executionCheckpointSchema],
    
    notes: { type: String },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

patrolExecutionSchema.statics.generateExecutionId = async function () {
  const latestExec = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestExec && latestExec.executionId) {
    const idParts = latestExec.executionId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `PEX-${nextId}`;
};

patrolExecutionSchema.pre("save", async function () {
  if (!this.executionId) {
    this.executionId = await (this.constructor as any).generateExecutionId();
  }
});

export const PatrolExecutionModel = model<IPatrolExecution, PatrolExecutionInterface>("PatrolExecution", patrolExecutionSchema);
