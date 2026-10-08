import { Model, Types } from "mongoose";

export interface INfcCheckpoint {
  _id?: Types.ObjectId;
  checkpointId?: string; // e.g., "NFC-0144"
  tagId: string; // The physical NFC tag ID (e.g., "04:6A:B2:..." or custom)
  name: string; // e.g., "Main Entrance"
  
  company: Types.ObjectId;
  location: Types.ObjectId;
  customer?: Types.ObjectId;
  
  status: "active" | "inactive" | "maintenance";
  
  // Specific placement details
  placementDescription?: string; // e.g., "Behind the front desk monitor"
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Tasks specifically triggered by scanning this tag directly
  linkedTasks?: Types.ObjectId[];
  
  lastScannedAt?: Date;
  lastScannedBy?: Types.ObjectId; // ref to User
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NfcCheckpointInterface extends Model<INfcCheckpoint> {
  generateCheckpointId(): Promise<string>;
}
