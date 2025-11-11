// import NoteClient from "./NoteClient";

// export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params; // ✅ unwrap async params at server level

//   return <NoteClient noteId={id} />;
// }

import NoteClient from "./NoteClient";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ unwrap async params at server level

  return <NoteClient noteId={id} />;
}