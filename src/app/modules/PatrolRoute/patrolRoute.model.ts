import { Schema, model } from "mongoose";
import { IPatrolRoute, PatrolRouteInterface } from "./patrolRoute.interface";

const routeCheckpointSchema = new Schema(
  {
    checkpoint: { type: Schema.Types.ObjectId, ref: "NfcCheckpoint", required: true },
    order: { type: Number, required: true },
    mandatory: { type: Boolean, default: true },
    timeLimitMinutes: { type: Number },
  },
  { _id: false }
);

const patrolRouteSchema = new Schema<IPatrolRoute, PatrolRouteInterface>(
  {
    routeId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    
    checkpoints: [routeCheckpointSchema],
    
    estimatedDurationMinutes: { type: Number, default: 30 },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

patrolRouteSchema.statics.generateRouteId = async function () {
  const latestRoute = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestRoute && latestRoute.routeId) {
    const idParts = latestRoute.routeId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `ROT-${nextId}`;
};

patrolRouteSchema.pre("save", async function () {
  if (!this.routeId) {
    this.routeId = await (this.constructor as any).generateRouteId();
  }
});

export const PatrolRouteModel = model<IPatrolRoute, PatrolRouteInterface>("PatrolRoute", patrolRouteSchema);
