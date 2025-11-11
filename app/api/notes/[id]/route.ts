// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Note from "@/models/Note";
// import bcrypt from "bcryptjs";

// // helper
// async function getParams(promiseParams: any) {
//   return await promiseParams;
// }

// //GET (Fetch a single note)

// export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await getParams(context.params);
//     await dbConnect();

//     // Find note by either _id or customId

//     const note = await Note.findOne({ $or: [{ _id: id }, { customId: id }] });
//     if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

//     // Expiry check

//     if (note.expiresAt && new Date(note.expiresAt) < new Date()) {
//       await Note.deleteOne({ _id: note._id });
//       return NextResponse.json({ error: "This note has expired and was deleted." }, { status: 410 });
//     }

//     // 🔐 Password-protected? Verify before sending

//     const url = new URL(req.url);
//     const password = url.searchParams.get("password");

//     if (note.password) {
//       if (!password)
//         return NextResponse.json({ protected: true, message: "Password required" }, { status: 401 });

//       const isMatch = await bcrypt.compare(password, note.password);
//       if (!isMatch)
//         return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
//     }

//     return NextResponse.json({ note }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching note:", error);
//     return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
//   }
// }

// //PUT (Update note content / password / expiry) 

// export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await getParams(context.params);
//     await dbConnect();

//     const body = await req.json();
//     const { content, password, expiryTimestamp } = body;
//     const updateFields: Record<string, any> = {};

//     if (content !== undefined) updateFields.content = content;

//     // 🔐 Hash password before saving

//     if (password !== undefined && password !== "") {
//       const hashed = await bcrypt.hash(password, 10);
//       updateFields.password = hashed;
//     }

//     if (expiryTimestamp !== undefined) {
//       updateFields.expiresAt = expiryTimestamp ? new Date(expiryTimestamp) : null;
//     }

//     // Update by either _id or customId

//     const updatedNote = await Note.findOneAndUpdate(
//       { $or: [{ _id: id }, { customId: id }] },
//       { $set: updateFields },
//       { new: true }
//     );

//     if (!updatedNote) return NextResponse.json({ error: "Note not found" }, { status: 404 });

//     return NextResponse.json({ message: "Note updated successfully", note: updatedNote }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating note:", error);
//     return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
//   }
// }

// // PATCH (Rename / Customize Note URL)

// export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await getParams(context.params);
//     await dbConnect();

//     const { newId } = await req.json();
//     if (!newId || typeof newId !== "string") {
//       return NextResponse.json({ error: "Invalid new ID" }, { status: 400 });
//     }

//     //Check if customId already taken

//     const existing = await Note.findOne({ customId: newId });
//     if (existing) {
//       return NextResponse.json({ error: "This custom name is already taken." }, { status: 409 });
//     }

//     // Find the note by _id or customId

//     const note = await Note.findOne({ $or: [{ _id: id }, { customId: id }] });
//     if (!note) {
//       return NextResponse.json({ error: "Note not found" }, { status: 404 });
//     }

//     //Assign new customId

//     note.customId = newId;
//     await note.save();

//     return NextResponse.json({ message: "Note ID updated successfully", newId }, { status: 200 });
//   } catch (error) {
//     console.error("Error renaming note:", error);
//     return NextResponse.json({ error: "Failed to rename note" }, { status: 500 });
//   }
// }

// //DELETE
// export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await getParams(context.params);
//     await dbConnect();

//     // Delete by _id or customId

//     await Note.deleteOne({ $or: [{ _id: id }, { customId: id }] });

//     return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error deleting note:", error);
//     return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";
import bcrypt from "bcryptjs";

// Helper for Next.js async context

async function getParams(promiseParams: any) {
  return await promiseParams;
}

/*  GET — Fetch a note (with expiry + password checks) */

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    // Find note by either _id or customId

    const note = await Note.findOne({ $or: [{ _id: id }, { customId: id }] });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    //Auto-delete if expired

    if (note.expiresAt && new Date(note.expiresAt).getTime() <= Date.now()) {
      await Note.deleteOne({ _id: note._id });
      return NextResponse.json(
        { error: "🗑️ This note has expired and was deleted." },
        { status: 410 }
      );
    }

    // 🔐 Password-protected logic

    const url = new URL(req.url);
    const password = url.searchParams.get("password");

    if (note.password) {
      if (!password) {
        return NextResponse.json(
          { protected: true, message: "Password required" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, note.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
      }
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

/*  PUT — Update note content, password, or expiry */

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const body = await req.json();
    const { content, password, expiryTimestamp } = body;
    const updateFields: Record<string, any> = {};

    if (content !== undefined) updateFields.content = content;

    // 🔐 Hash password if provided

    if (password !== undefined && password !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateFields.password = hashed;
    }

    // 🕒 Expiry update

    if (expiryTimestamp !== undefined) {
      updateFields.expiresAt = expiryTimestamp ? new Date(expiryTimestamp) : null;
    }

    const updatedNote = await Note.findOneAndUpdate(
      { $or: [{ _id: id }, { customId: id }] },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Note updated successfully", note: updatedNote },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

/* PATCH — Rename / Customize Note URL */

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const { newId } = await req.json();
    if (!newId || typeof newId !== "string") {
      return NextResponse.json({ error: "Invalid new ID" }, { status: 400 });
    }

    // Check if the new customId already exists

    const existing = await Note.findOne({ customId: newId });
    if (existing) {
      return NextResponse.json(
        { error: "This custom name is already taken." },
        { status: 409 }
      );
    }

    // Find by either _id or customId

    const note = await Note.findOne({ $or: [{ _id: id }, { customId: id }] });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Assign new customId

    note.customId = newId;
    await note.save();

    return NextResponse.json(
      { message: "Note ID updated successfully", newId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error renaming note:", error);
    return NextResponse.json({ error: "Failed to rename note" }, { status: 500 });
  }
}

/*  DELETE — Remove a note manually */

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    await Note.deleteOne({ $or: [{ _id: id }, { customId: id }] });

    return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
