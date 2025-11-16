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

<<<<<<< HEAD
    // Safely parse body if present

=======
    // ✅ Safely parse body if present
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    let body: NoteRequest = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { content = "", password = "", editable = true } = body;

<<<<<<< HEAD
    // Generate unique note ID

=======
    // ✅ Generate unique note ID
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    const uniqueId = nanoid(10);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

<<<<<<< HEAD
    //Create a new note document in MongoDB

=======
    // ✅ Create a new note document in MongoDB
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
    const note = await Note.create({
      _id: uniqueId,
      content,
      password,
      editable,
      expiresAt: expiryDate,
    });

<<<<<<< HEAD
    // Respond with the new note info
    
=======
    // ✅ Respond with the new note info
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
