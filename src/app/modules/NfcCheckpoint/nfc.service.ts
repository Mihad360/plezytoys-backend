import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { NfcCheckpointModel } from "./nfc.model";
import { INfcCheckpoint } from "./nfc.interface";

const createNfcIntoDB = async (payload: INfcCheckpoint) => {
  const newNfc = await NfcCheckpointModel.create(payload);
  return newNfc;
};

const getAllNfcsFromDB = async (companyId?: string, locationId?: string) => {
  const query: any = {};
  if (companyId) query.company = companyId;
  if (locationId) query.location = locationId;
  
  const nfcs = await NfcCheckpointModel.find(query)
    .sort({ createdAt: -1 })
    .populate('location', 'name')
    .populate('customer', 'companyName');
  return nfcs;
};

const getNfcByIdFromDB = async (id: string) => {
  const nfc = await NfcCheckpointModel.findById(id)
    .populate('location', 'name')
    .populate('customer', 'companyName');
    
  if (!nfc) {
    throw new AppError(HttpStatus.NOT_FOUND, "NFC Checkpoint not found");
  }
  return nfc;
};

const updateNfcInDB = async (id: string, payload: Partial<INfcCheckpoint>) => {
  const nfc = await NfcCheckpointModel.findById(id);
  if (!nfc) {
    throw new AppError(HttpStatus.NOT_FOUND, "NFC Checkpoint not found");
  }

  const updatedNfc = await NfcCheckpointModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedNfc;
};

const deleteNfcFromDB = async (id: string) => {
  const nfc = await NfcCheckpointModel.findById(id);
  if (!nfc) {
    throw new AppError(HttpStatus.NOT_FOUND, "NFC Checkpoint not found");
  }
  
  const deletedNfc = await NfcCheckpointModel.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  );
  return deletedNfc;
};

export const NfcServices = {
  createNfcIntoDB,
  getAllNfcsFromDB,
  getNfcByIdFromDB,
  updateNfcInDB,
  deleteNfcFromDB,
};
