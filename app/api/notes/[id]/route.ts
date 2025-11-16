import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";
<<<<<<< HEAD
import bcrypt from "bcryptjs";

// Helper for Next.js async context

=======

// ⚙️ Helper to unwrap params safely
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
async function getParams(promiseParams: any) {
  return await promiseParams;
}

<<<<<<< HEAD
/*  GET — Fetch a note (with expiry + password checks) */

=======
// ---------- GET (Fetch a single note) ----------
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

<<<<<<< HEAD
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
=======
    const note = await Note.findOne({ _id: id });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    // Check expiry
    if (note.expiresAt && new Date(note.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This note has expired." }, { status: 410 });
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

<<<<<<< HEAD
/*  PUT — Update note content, password, or expiry */

=======
// ---------- PUT (Update note content or password) ----------
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const body = await req.json();
<<<<<<< HEAD
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
=======
    const { content, password } = body;

    const updateFields: Record<string, any> = {};
    if (content !== undefined) updateFields.content = content;
    if (password !== undefined) updateFields.password = password;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id },
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
      { $set: updateFields },
      { new: true }
    );

<<<<<<< HEAD
    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Note updated successfully", note: updatedNote },
      { status: 200 }
    );
=======
    if (!updatedNote) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    console.log(`💾 Updated note: ${id}`, updateFields);
    return NextResponse.json({ message: "Note updated successfully", note: updatedNote }, { status: 200 });
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

<<<<<<< HEAD
/* PATCH — Rename / Customize Note URL */

=======
// ---------- PATCH (Rename / Customize Note URL) ----------
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const { newId } = await req.json();
    if (!newId || typeof newId !== "string") {
      return NextResponse.json({ error: "Invalid new ID" }, { status: 400 });
    }

<<<<<<< HEAD
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
=======
    // Check if the new ID already exists
    const existing = await Note.findOne({ _id: newId });
    if (existing) {
      return NextResponse.json({ error: "This custom name is already taken." }, { status: 409 });
    }

    // Find the old note
    const note = await Note.findOne({ _id: id });
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

<<<<<<< HEAD
    // Assign new customId

    note.customId = newId;
    await note.save();

    return NextResponse.json(
      { message: "Note ID updated successfully", newId },
      { status: 200 }
    );
=======
    // Duplicate the note with the new ID
    const newNote = new Note({
      _id: newId,
      content: note.content,
      password: note.password,
      editable: note.editable,
      expiresAt: note.expiresAt,
    });
    await newNote.save();

    // Delete the old note
    await Note.deleteOne({ _id: id });

    console.log(`🔗 Note ID changed from "${id}" → "${newId}"`);

    return NextResponse.json({ message: "Note ID updated successfully", newId }, { status: 200 });
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
  } catch (error) {
    console.error("Error renaming note:", error);
    return NextResponse.json({ error: "Failed to rename note" }, { status: 500 });
  }
}
<<<<<<< HEAD

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
=======
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
