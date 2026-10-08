import { Schema, model } from "mongoose";
import { IDocument, DocumentInterface } from "./document.interface";

const documentSchema = new Schema<IDocument, DocumentInterface>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["certificates", "identification", "qualifications"],
      required: true,
    },
    documentType: { type: String, required: true },
    
    status: {
      type: String,
      enum: ["valid", "expiring_soon", "expired"],
      default: "valid",
    },
    
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    
    fileUrl: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    
    syncStatus: {
      type: String,
      enum: ["synced", "pending", "failed"],
      default: "synced",
    },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-calculate status based on expiry
documentSchema.pre("save", function () {
  if (this.expiryDate) {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiry < now) {
      this.status = "expired";
    } else if (expiry <= thirtyDaysFromNow) {
      this.status = "expiring_soon";
    } else {
      this.status = "valid";
    }
  }
});

export const DocumentModel = model<IDocument, DocumentInterface>("Document", documentSchema);
