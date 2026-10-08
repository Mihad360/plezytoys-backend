import { Model, Types } from "mongoose";

export interface IRouteCheckpoint {
  checkpoint: Types.ObjectId; // ref to NfcCheckpoint
  order: number;
  mandatory: boolean;
  timeLimitMinutes?: number;
}

export interface IPatrolRoute {
  _id?: Types.ObjectId;
  routeId?: string; // e.g., "ROT-014"
  name: string; // e.g., "Night Shift Perimeter"
  description?: string;
  
  company: Types.ObjectId;
  location: Types.ObjectId;
  
  checkpoints: IRouteCheckpoint[];
  
  estimatedDurationMinutes?: number;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatrolRouteInterface extends Model<IPatrolRoute> {
  generateRouteId(): Promise<string>;
}
