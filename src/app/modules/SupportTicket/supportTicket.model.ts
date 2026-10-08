import { Schema, model } from "mongoose";
import { ISupportTicket, SupportTicketInterface } from "./supportTicket.interface";

const ticketMessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["company_admin", "super_admin"], required: true },
    senderName: { type: String },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const supportTicketSchema = new Schema<ISupportTicket, SupportTicketInterface>(
  {
    ticketNumber: { type: String, unique: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    subject: { type: String, required: true },
    description: { type: String, required: true },
    
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    
    assignedToAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [ticketMessageSchema],
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.statics.generateTicketNumber = async function () {
  const latest = await this.findOne().sort({ createdAt: -1 });
  let nextId = 1001;
  
  if (latest && latest.ticketNumber) {
    const parts = latest.ticketNumber.split("-");
    if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      nextId = parseInt(parts[1]) + 1;
    }
  }
  return `TKT-${nextId}`;
};

supportTicketSchema.pre("save", async function () {
  if (!this.ticketNumber) {
    this.ticketNumber = await (this.constructor as any).generateTicketNumber();
  }
});

export const SupportTicketModel = model<ISupportTicket, SupportTicketInterface>("SupportTicket", supportTicketSchema);
