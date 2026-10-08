import { Model, Types } from "mongoose";

export interface IAnnouncementRead {
  user: Types.ObjectId;
  readAt: Date;
}

export interface IAnnouncement {
  _id?: Types.ObjectId;
  company: Types.ObjectId;
  
  title: string;
  content: string;
  
  target: "all" | "managers" | "employees" | "specific_team" | "specific_location";
  targetEntities?: Types.ObjectId[]; // specific user/team/location IDs
  
  publishedAt?: Date;
  readBy?: IAnnouncementRead[];
  
  createdBy: Types.ObjectId; // ref to User (Company Admin / Manager)
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AnnouncementInterface extends Model<IAnnouncement> {}
