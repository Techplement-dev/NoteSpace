import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";

// ⚙️ Helper to unwrap params safely
async function getParams(promiseParams: any) {
  return await promiseParams;
}

// ---------- GET (Fetch a single note) ----------
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const note = await Note.findOne({ _id: id });
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    // Check expiry
    if (note.expiresAt && new Date(note.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This note has expired." }, { status: 410 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

// ---------- PUT (Update note content or password) ----------
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const body = await req.json();
    const { content, password } = body;

    const updateFields: Record<string, any> = {};
    if (content !== undefined) updateFields.content = content;
    if (password !== undefined) updateFields.password = password;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedNote) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    console.log(`💾 Updated note: ${id}`, updateFields);
    return NextResponse.json({ message: "Note updated successfully", note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

// ---------- PATCH (Rename / Customize Note URL) ----------
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await getParams(context.params);
    await dbConnect();

    const { newId } = await req.json();
    if (!newId || typeof newId !== "string") {
      return NextResponse.json({ error: "Invalid new ID" }, { status: 400 });
    }

    // Check if the new ID already exists
    const existing = await Note.findOne({ _id: newId });
    if (existing) {
      return NextResponse.json({ error: "This custom name is already taken." }, { status: 409 });
    }

    // Find the old note
    const note = await Note.findOne({ _id: id });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

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
  } catch (error) {
    console.error("Error renaming note:", error);
    return NextResponse.json({ error: "Failed to rename note" }, { status: 500 });
  }
}
