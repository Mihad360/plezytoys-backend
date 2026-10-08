import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { WorkSessionModel } from "./workSession.model";
import { UserModel } from "../User/user.model";
import { LocationModel } from "../Location/location.model";
import { IWorkSession } from "./workSession.interface";
import { sendNotification, sendNotificationToCompanyRoles } from "../Notification/notification.utils";

// Haversine formula to compute distance in meters
const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const clockInIntoDB = async (userId: string, payload: any) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "User or company not found");
  }

  // Check if already clocked in
  const activeSession = await WorkSessionModel.findOne({ user: userId, status: "active" });
  if (activeSession) {
    throw new AppError(HttpStatus.CONFLICT, "User is already clocked in");
  }

  const location = await LocationModel.findById(payload.location);
  if (!location) {
    throw new AppError(HttpStatus.NOT_FOUND, "Location not found");
  }

  let isVerified = true;
  let isAnomaly = false;

  if (
    payload.clockInLocation?.latitude &&
    payload.clockInLocation?.longitude &&
    location.coordinates?.latitude &&
    location.coordinates?.longitude
  ) {
    const distance = calculateDistanceMeters(
      payload.clockInLocation.latitude,
      payload.clockInLocation.longitude,
      location.coordinates.latitude,
      location.coordinates.longitude
    );

    const allowedRadius = location.radius || 50; // default 50 meters
    if (distance > allowedRadius) {
      isVerified = false;
      isAnomaly = true;
    }
  }

  const clockInLocationData = payload.clockInLocation
    ? {
        ...payload.clockInLocation,
        isVerified,
        isAnomaly,
      }
    : undefined;

  const newSession = await WorkSessionModel.create({
    ...payload,
    user: userId,
    company: user.company,
    clockInTime: new Date(),
    clockInLocation: clockInLocationData,
    lastPingAt: new Date(),
    lastPingLocation: clockInLocationData,
    status: "active",
  });

  // If GPS anomaly detected, notify manager and company admin
  if (isAnomaly) {
    const anomalyMessage = `${user.name || user.firstName} clocked in outside the permitted radius for ${location.name}.`;
    const managerId = user.assignedManager;
    if (managerId) {
      await sendNotification({
        recipientId: managerId.toString(),
        senderId: userId,
        type: "attendance",
        title: "GPS Anomaly Detected",
        message: anomalyMessage,
        data: {
          sessionId: newSession._id.toString(),
          locationId: location._id.toString(),
          anomalyType: "gps_outside_zone",
        },
      });
    }

    if (user.company) {
      await sendNotificationToCompanyRoles({
        companyId: user.company.toString(),
        roles: ["manager", "company_admin"],
        type: "attendance",
        title: "GPS Anomaly Detected",
        message: anomalyMessage,
        data: {
          sessionId: newSession._id.toString(),
          locationId: location._id.toString(),
          anomalyType: "gps_outside_zone",
        },
        senderId: userId,
      });
    }
  }

  return newSession;
};

const clockOutInDB = async (userId: string, payload: any) => {
  const activeSession = await WorkSessionModel.findOne({ user: userId, status: "active" });
  if (!activeSession) {
    throw new AppError(HttpStatus.NOT_FOUND, "No active work session found to clock out");
  }

  const clockOutTime = new Date();
  const durationMs = clockOutTime.getTime() - activeSession.clockInTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);

  activeSession.clockOutTime = clockOutTime;
  activeSession.clockOutLocation = payload.clockOutLocation;
  if (payload.notes) {
    activeSession.notes = activeSession.notes ? `${activeSession.notes}\n${payload.notes}` : payload.notes;
  }
  activeSession.status = "completed";
  activeSession.durationMinutes = durationMinutes;

  await activeSession.save();
  return activeSession;
};

const getActiveSessionFromDB = async (userId: string) => {
  const activeSession = await WorkSessionModel.findOne({ user: userId, status: "active" })
    .populate("location", "name address radius coordinates")
    .populate("shift");
  return activeSession;
};

const pingHeartbeatInDB = async (userId: string, payload: { latitude: number; longitude: number; accuracy?: number }) => {
  const activeSession = await WorkSessionModel.findOne({ user: userId, status: "active" });
  if (!activeSession) {
    return null;
  }

  activeSession.lastPingAt = new Date();
  activeSession.lastPingLocation = {
    latitude: payload.latitude,
    longitude: payload.longitude,
    accuracy: payload.accuracy,
    isVerified: true,
  };

  await activeSession.save();
  return activeSession;
};

const getMySessionsFromDB = async (userId: string) => {
  return await WorkSessionModel.find({ user: userId })
    .sort({ clockInTime: -1 })
    .populate("location", "name address");
};

const getCompanySessionsFromDB = async (companyId: string, locationId?: string) => {
  const query: any = { company: companyId };
  if (locationId) query.location = locationId;

  return await WorkSessionModel.find(query)
    .sort({ clockInTime: -1 })
    .populate("user", "firstName lastName email employeeId avatar")
    .populate("location", "name address");
};

export const WorkSessionServices = {
  clockInIntoDB,
  clockOutInDB,
  getActiveSessionFromDB,
  pingHeartbeatInDB,
  getMySessionsFromDB,
  getCompanySessionsFromDB,
};
