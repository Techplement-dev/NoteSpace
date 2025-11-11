// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Note from "@/models/Note";

// // ---------- GET all notes ----------
// export async function GET() {
//   try {
//     await dbConnect();
//     const notes = await Note.find({}); // ✅ fetch all notes
//     return NextResponse.json({ notes }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching all notes:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch notes" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Note from "@/models/Note";

// -- GET all notes --

export async function GET() {
  try {
    await dbConnect();
    const notes = await Note.find({});                             //fetch all notes
    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching all notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}