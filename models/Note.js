<<<<<<< HEAD
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

=======
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
    _id: { type: String, required: true },
    customId: { type: String, unique: true, sparse: true },         //add support for custom URLs
    content: { type: String, default: "" },
    password: { type: String, default: "" },                        // stores hashed password
=======
    _id: { type: String }, // <-- add this line for custom string ID
    content: { type: String, default: "" },
    password: { type: String, default: "" },
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    editable: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
=======
export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
