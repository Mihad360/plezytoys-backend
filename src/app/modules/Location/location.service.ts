import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { LocationModel } from "./location.model";
import { ILocation } from "./location.interface";

const createLocationIntoDB = async (payload: ILocation) => {
  const newLocation = await LocationModel.create(payload);
  return newLocation;
};

const getAllLocationsFromDB = async (companyId?: string, customerId?: string) => {
  const query: any = {};
  if (companyId) query.company = companyId;
  if (customerId) query.customer = customerId;
  
  const locations = await LocationModel.find(query)
    .sort({ createdAt: -1 })
    .populate('company', 'name')
    .populate('customer', 'companyName');
  return locations;
};

const getLocationByIdFromDB = async (id: string) => {
  const location = await LocationModel.findById(id)
    .populate('company', 'name')
    .populate('customer', 'companyName');
    
  if (!location) {
    throw new AppError(HttpStatus.NOT_FOUND, "Location not found");
  }
  return location;
};

const updateLocationInDB = async (id: string, payload: Partial<ILocation>) => {
  const location = await LocationModel.findById(id);
  if (!location) {
    throw new AppError(HttpStatus.NOT_FOUND, "Location not found");
  }

  const updatedLocation = await LocationModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedLocation;
};

const deleteLocationFromDB = async (id: string) => {
  const location = await LocationModel.findById(id);
  if (!location) {
    throw new AppError(HttpStatus.NOT_FOUND, "Location not found");
  }
  
  const deletedLocation = await LocationModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return deletedLocation;
};

export const LocationServices = {
  createLocationIntoDB,
  getAllLocationsFromDB,
  getLocationByIdFromDB,
  updateLocationInDB,
  deleteLocationFromDB,
};
