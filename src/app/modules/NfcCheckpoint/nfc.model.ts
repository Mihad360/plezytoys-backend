import { Schema, model } from "mongoose";
import { INfcCheckpoint, NfcCheckpointInterface } from "./nfc.interface";

const coordinatesSchema = new Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const nfcCheckpointSchema = new Schema<INfcCheckpoint, NfcCheckpointInterface>(
  {
    checkpointId: { type: String, unique: true },
    tagId: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    
    placementDescription: { type: String, trim: true },
    coordinates: { type: coordinatesSchema },
    
    linkedTasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    
    lastScannedAt: { type: Date },
    lastScannedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

nfcCheckpointSchema.statics.generateCheckpointId = async function () {
  const latestNfc = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestNfc && latestNfc.checkpointId) {
    const idParts = latestNfc.checkpointId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `NFC-${nextId}`;
};

nfcCheckpointSchema.pre("save", async function () {
  if (!this.checkpointId) {
    this.checkpointId = await (this.constructor as any).generateCheckpointId();
  }
});

export const NfcCheckpointModel = model<INfcCheckpoint, NfcCheckpointInterface>("NfcCheckpoint", nfcCheckpointSchema);
