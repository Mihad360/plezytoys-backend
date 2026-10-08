import { Model, Types } from "mongoose";

export interface ICheckpointVerificationData {
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    isVerified?: boolean;
  };
  nfcVerified?: boolean;
  nfcUid?: string;
  originalTimestamp?: Date;
}

export interface IExecutionCheckpoint {
  checkpoint: Types.ObjectId; // ref to NfcCheckpoint
  scannedAt?: Date;
  status: "pending" | "scanned" | "missed";
  notes?: string;
  missedReason?: string;
  photoUrl?: string;
  verificationData?: ICheckpointVerificationData;
}

export interface IPatrolExecution {
  _id?: Types.ObjectId;
  executionId?: string; // e.g., "PEX-1042"
  
  route: Types.ObjectId; // ref to PatrolRoute
  executedBy: Types.ObjectId; // ref to User (Employee)
  company: Types.ObjectId;
  location: Types.ObjectId;
  
  startTime: Date;
  endTime?: Date;
  
  status: "in_progress" | "completed" | "incomplete" | "abandoned";
  
  checkpoints: IExecutionCheckpoint[];
  
  notes?: string;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatrolExecutionInterface extends Model<IPatrolExecution> {
  generateExecutionId(): Promise<string>;
}
