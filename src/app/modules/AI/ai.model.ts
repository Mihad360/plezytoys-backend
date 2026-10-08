import { Schema, model } from "mongoose";
import { IKnowledgeSource, IUnresolvedQuestion, KnowledgeSourceInterface, UnresolvedQuestionInterface } from "./ai.interface";

const knowledgeSourceSchema = new Schema<IKnowledgeSource, KnowledgeSourceInterface>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true },
    content: { type: String },
    fileUrl: { type: String },
    type: { type: String, enum: ["document", "url", "text"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const unresolvedQuestionSchema = new Schema<IUnresolvedQuestion, UnresolvedQuestionInterface>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    suggestedAnswer: { type: String },
    status: {
      type: String,
      enum: ["unresolved", "answered", "dismissed"],
      default: "unresolved",
    },
  },
  { timestamps: true }
);

export const KnowledgeSourceModel = model<IKnowledgeSource, KnowledgeSourceInterface>("KnowledgeSource", knowledgeSourceSchema);
export const UnresolvedQuestionModel = model<IUnresolvedQuestion, UnresolvedQuestionInterface>("UnresolvedQuestion", unresolvedQuestionSchema);
