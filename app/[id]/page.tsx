<<<<<<< HEAD
import NoteClient from "@/app/[id]/NoteClient";

export default async function NotePage({ params }: { params: Promise<{ id: string }>

}) { const { id } = await params; // ✅ unwrap async params at server level 
return <NoteClient noteId={id} />; }
=======
import NoteClient from "./NoteClient";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ unwrap async params at server level

  return <NoteClient noteId={id} />;
}
>>>>>>> 780461f4a5f7a0a7aec153226935fdca1fcf335e
