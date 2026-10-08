import { Model, Types } from "mongoose";

export interface IKnowledgeSource {
  _id?: Types.ObjectId;
  company: Types.ObjectId;
  
  title: string;
  content?: string;
  fileUrl?: string;
  
  type: "document" | "url" | "text";
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUnresolvedQuestion {
  _id?: Types.ObjectId;
  company: Types.ObjectId;
  user: Types.ObjectId;
  
  question: string;
  suggestedAnswer?: string;
  
  status: "unresolved" | "answered" | "dismissed";
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KnowledgeSourceInterface extends Model<IKnowledgeSource> {}
export interface UnresolvedQuestionInterface extends Model<IUnresolvedQuestion> {}
