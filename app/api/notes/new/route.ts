import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";
import { nanoid } from "nanoid";

interface NoteRequest {
  content?: string;
  password?: string;
  editable?: boolean;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    // Safely parse body if present

    let body: NoteRequest = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { content = "", password = "", editable = true } = body;

    // Generate unique note ID

    const uniqueId = nanoid(10);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    //Create a new note document in MongoDB

    const note = await Note.create({
      _id: uniqueId,
      content,
      password,
      editable,
      expiresAt: expiryDate,
    });

    // Respond with the new note info
    
    return NextResponse.json(
      {
        message: "Note created successfully",
        note,
        id: note._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}