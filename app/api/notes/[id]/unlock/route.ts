import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { password } = await req.json();

    await dbConnect();

    const note = await Note.findOne({ _id: id });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // If note has no password, grant direct access
    if (!note.password) {
      return NextResponse.json({ access: true, message: "No password set" }, { status: 200 });
    }

    // Compare the provided password
    if (note.password === password) {
      return NextResponse.json({ access: true, message: "Password correct" }, { status: 200 });
    } else {
      return NextResponse.json({ access: false, message: "Incorrect password" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json({ error: "Failed to verify password" }, { status: 500 });
  }
}
