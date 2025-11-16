// import mongoose from "mongoose";

// const NoteSchema = new mongoose.Schema(
//   {
//     _id: { type: String, required: true },
//     content: { type: String, default: "" },
//     password: { type: String, default: "" },
//     editable: { type: Boolean, default: true },
//     expiresAt: { type: Date, default: null }, // <-- used for TTL auto deletion
//   },
//   { timestamps: true }
// );

// //  TTL index: MongoDB deletes notes automatically once expiresAt < now
// NoteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export default mongoose.models.Note || mongoose.model("Note", NoteSchema);

import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    customId: { type: String, unique: true, sparse: true },         //add support for custom URLs
    content: { type: String, default: "" },
    password: { type: String, default: "" },                        // stores hashed password
    editable: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);