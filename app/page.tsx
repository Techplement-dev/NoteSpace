"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const createNote = async () => {
      try {
        console.log("Creating a new note...");
        const res = await fetch("/api/notes/new", { method: "POST" });
        const data = await res.json();
        console.log("Response from API:", data);

        if (data?.id) {
          router.replace(`/${data.id}`);
        } else {
          console.error("No note ID returned from API.");
        }
      } catch (err) {
        console.error("Error creating new note:", err);
      }
    };
    createNote();
  }, [router]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#888",
        fontFamily: "sans-serif",
      }}
    >
🪄 Just a moment — setting up your note...
    </div>
  );
}