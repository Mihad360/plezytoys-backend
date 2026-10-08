import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { PatrolRouteModel } from "./patrolRoute.model";
import { IPatrolRoute } from "./patrolRoute.interface";

const createPatrolRouteIntoDB = async (payload: IPatrolRoute) => {
  const newRoute = await PatrolRouteModel.create(payload);
  return newRoute;
};

const getAllPatrolRoutesFromDB = async (companyId?: string, locationId?: string) => {
  const query: any = {};
  if (companyId) query.company = companyId;
  if (locationId) query.location = locationId;
  
  const routes = await PatrolRouteModel.find(query)
    .sort({ createdAt: -1 })
    .populate('location', 'name')
    .populate('checkpoints.checkpoint', 'name tagId');
  return routes;
};

const getPatrolRouteByIdFromDB = async (id: string) => {
  const route = await PatrolRouteModel.findById(id)
    .populate('location', 'name')
    .populate('checkpoints.checkpoint', 'name tagId placementDescription');
    
  if (!route) {
    throw new AppError(HttpStatus.NOT_FOUND, "Patrol Route not found");
  }
  return route;
};

const updatePatrolRouteInDB = async (id: string, payload: Partial<IPatrolRoute>) => {
  const route = await PatrolRouteModel.findById(id);
  if (!route) {
    throw new AppError(HttpStatus.NOT_FOUND, "Patrol Route not found");
  }

  const updatedRoute = await PatrolRouteModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedRoute;
};

const deletePatrolRouteFromDB = async (id: string) => {
  const route = await PatrolRouteModel.findById(id);
  if (!route) {
    throw new AppError(HttpStatus.NOT_FOUND, "Patrol Route not found");
  }
  
  const deletedRoute = await PatrolRouteModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return deletedRoute;
};

export const PatrolRouteServices = {
  createPatrolRouteIntoDB,
  getAllPatrolRoutesFromDB,
  getPatrolRouteByIdFromDB,
  updatePatrolRouteInDB,
  deletePatrolRouteFromDB,
};
