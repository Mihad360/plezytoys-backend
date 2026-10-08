import { Schema, model } from "mongoose";
import { ILocation, LocationInterface } from "./location.interface";

const coordinatesSchema = new Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const locationSchema = new Schema<ILocation, LocationInterface>(
  {
    locationId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    
    address: { type: String },
    
    coordinates: { type: coordinatesSchema },
    radius: { type: Number, default: 50 }, // Default 50m geofence
    timezone: { type: String, default: "Europe/Amsterdam" },
    
    assignedEmployeesCount: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

locationSchema.statics.generateLocationId = async function () {
  const latestLocation = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestLocation && latestLocation.locationId) {
    const idParts = latestLocation.locationId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `LOC-${nextId}`;
};

locationSchema.pre("save", async function () {
  if (!this.locationId) {
    this.locationId = await (this.constructor as any).generateLocationId();
  }
});

export const LocationModel = model<ILocation, LocationInterface>("Location", locationSchema);
