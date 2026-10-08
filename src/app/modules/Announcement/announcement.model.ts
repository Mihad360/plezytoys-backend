import { Schema, model } from "mongoose";
import { IAnnouncement, AnnouncementInterface } from "./announcement.interface";

const readSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const announcementSchema = new Schema<IAnnouncement, AnnouncementInterface>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    
    target: {
      type: String,
      enum: ["all", "managers", "employees", "specific_team", "specific_location"],
      default: "all",
    },
    targetEntities: [{ type: Schema.Types.ObjectId }],
    
    publishedAt: { type: Date, default: Date.now },
    readBy: [readSchema],
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const AnnouncementModel = model<IAnnouncement, AnnouncementInterface>("Announcement", announcementSchema);
