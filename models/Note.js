import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    _id: { type: String }, // <-- add this line for custom string ID
    content: { type: String, default: "" },
    password: { type: String, default: "" },
    editable: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
