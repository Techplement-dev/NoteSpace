// import NoteClient from "@/app/[id]/NoteClient";

import NoteClient from "@/app/[id]/NoteClient";


// export default function ReadOnlyPage({ params }: { params: { id: string } }) {
//   const { id } = params;
//   return <NoteClient noteId={id} isReadOnly={false} />;
// }

// import NoteClient from "./NoteClient"; 
export default async function NotePage({ params }: { params: Promise<{ id: string }>

}) { const { id } = await params; // ✅ unwrap async params at server level 
return <NoteClient noteId={id} isReadOnly={true}/>; }