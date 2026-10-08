import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { CustomerModel } from "./customer.model";
import { ICustomer } from "./customer.interface";

const createCustomerIntoDB = async (payload: ICustomer) => {
  const newCustomer = await CustomerModel.create(payload);
  return newCustomer;
};

const getAllCustomersFromDB = async (companyId?: string) => {
  const query = companyId ? { company: companyId } : {};
  const customers = await CustomerModel.find(query).sort({ createdAt: -1 }).populate('company', 'name');
  return customers;
};

const getCustomerByIdFromDB = async (id: string) => {
  const customer = await CustomerModel.findById(id).populate('company', 'name');
  if (!customer) {
    throw new AppError(HttpStatus.NOT_FOUND, "Customer not found");
  }
  return customer;
};

const updateCustomerInDB = async (id: string, payload: Partial<ICustomer>) => {
  const customer = await CustomerModel.findById(id);
  if (!customer) {
    throw new AppError(HttpStatus.NOT_FOUND, "Customer not found");
  }

  const updatedCustomer = await CustomerModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedCustomer;
};

const deleteCustomerFromDB = async (id: string) => {
  const customer = await CustomerModel.findById(id);
  if (!customer) {
    throw new AppError(HttpStatus.NOT_FOUND, "Customer not found");
  }
  
  const deletedCustomer = await CustomerModel.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  return deletedCustomer;
};

export const CustomerServices = {
  createCustomerIntoDB,
  getAllCustomersFromDB,
  getCustomerByIdFromDB,
  updateCustomerInDB,
  deleteCustomerFromDB,
};
