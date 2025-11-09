"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NoteClient({ noteId }: { noteId: string }) {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRenameBox, setShowRenameBox] = useState(false); // 👈 New state for custom URL
  const [newUrlName, setNewUrlName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReadOnly = searchParams.get("readonly") === "true";

  // ---------- Fetch note ----------
  useEffect(() => {
    if (!noteId) return;
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (!res.ok) throw new Error("Failed to fetch note");
        const data = await res.json();

        if (data.note) {
          if (data.note.password) {
            setIsLocked(true);
            setShowPasswordPrompt(true);
          } else {
            setContent(data.note.content || "");
            setIsLocked(false);
          }
        }
      } catch (err) {
        console.error("Error fetching note:", err);
      }
    };
    fetchNote();
  }, [noteId]);

  // ---------- Auto-save ----------
  useEffect(() => {
    if (!noteId || isReadOnly || isLocked) return;
    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        setSaved(false);
        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error(`Failed to save (${res.status})`);
        setSaving(false);
        setSaved(true);
        setLastSaved(new Date().toLocaleTimeString());
        setTimeout(() => setSaved(false), 1500);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaving(false);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [content, noteId, isReadOnly, isLocked]);

  // ---------- Create new note ----------
  const createNewNote = async () => {
    try {
      const res = await fetch("/api/notes/new", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create new note");
      const data = await res.json();
      if (data.id) router.push(`/${data.id}`);
    } catch (err) {
      console.error("Error creating new note:", err);
    }
  };

  // ---------- Password Functions ----------
  const lockNote = async () => {
    if (!password) {
      alert("Please enter a password to lock this note.");
      return;
    }
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Failed to lock note");
      alert("🔒 Password set successfully!");
      setShowPasswordPrompt(false);
      setPassword("");
    } catch (err) {
      console.error("Error locking note:", err);
    }
  };

  const unlockNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      const noteData = await res.json();
      if (noteData.note.password === password) {
        setContent(noteData.note.content || "");
        setIsLocked(false);
        setShowPasswordPrompt(false);
        setPassword("");
      } else {
        alert("❌ Incorrect password");
      }
    } catch (err) {
      console.error("Error unlocking note:", err);
    }
  };

  const copyEditableLink = () => {
    const editableURL = `${window.location.origin}/${noteId}`;
    navigator.clipboard.writeText(editableURL);
    alert("✅ Editable link copied!");
  };

  const copyReadOnlyLink = () => {
    const readonlyURL = `${window.location.origin}/${noteId}?readonly=true`;
    navigator.clipboard.writeText(readonlyURL);
    alert("🔗 Read-only link copied!");
  };

  // ---------- Customize URL ----------
  const customizeUrl = async () => {
    if (!newUrlName) {
      alert("Please enter a valid name.");
      return;
    }
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newId: newUrlName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rename failed");
      alert("✅ URL updated!");
      setShowRenameBox(false);
      router.replace(`/${newUrlName}`);
    } catch (err: any) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fb",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* ---------- Top Bar ---------- */}
      <div
        style={{
          width: "85%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ color: "#444", fontWeight: "500" }}>📝 NoteSpace</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saving && <span style={{ color: "#999" }}>Saving...</span>}
          {saved && <span style={{ color: "green" }}>✓ Saved ({lastSaved})</span>}

          {!isReadOnly && (
            <>
              <button
                onClick={() => setShowPasswordPrompt(true)}
                style={{
                  backgroundColor: "#c27ad8",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔒 Set Password
              </button>

              <button
                onClick={() => setShowRenameBox(true)}
                style={{
                  backgroundColor: "#a78bfa",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✏️ Customize URL
              </button>
            </>
          )}

          {!isReadOnly && (
            <span
              onClick={createNewNote}
              style={{
                cursor: "pointer",
                fontSize: "22px",
                backgroundColor: "#c27ad8",
                color: "#fff",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                userSelect: "none",
              }}
              title="New Note"
            >
              ＋
            </span>
          )}
        </div>
      </div>

      {/* ---------- Text Area ---------- */}
      <div
        style={{
          backgroundColor: "#fff",
          width: "85%",
          height: "80%",
          border: "1px solid #ddd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "6px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isLocked
              ? "🔒 This note is protected. Please enter password."
              : "Start typing..."
          }
          readOnly={isLocked || isReadOnly}
          style={{
            width: "100%",
            height: "100%",
            padding: "16px",
            border: "none",
            outline: "none",
            fontSize: "15px",
            resize: "none",
            fontFamily: "monospace",
            color: isLocked ? "#888" : "#333",
            backgroundColor: isLocked ? "#f6f6f6" : "#fff",
          }}
        />

        {/* ---------- Password Modal ---------- */}
        {showPasswordPrompt && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              {isLocked ? "Enter Password to Unlock" : "Set a Password"}
            </h3>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "4px",
                paddingRight: "8px",
                marginBottom: "10px",
                width: "220px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "none",
                  outline: "none",
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "16px",
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {isLocked ? (
                <button onClick={unlockNote}>Unlock</button>
              ) : (
                <button onClick={lockNote}>Lock</button>
              )}
              <button onClick={() => setShowPasswordPrompt(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ---------- Customize URL Modal ---------- */}
        {showRenameBox && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 15,
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>Customize your Note URL</h3>
            <input
              type="text"
              value={newUrlName}
              onChange={(e) => setNewUrlName(e.target.value)}
              placeholder="Enter new URL (e.g. abc123)"
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginBottom: "12px",
                width: "220px",
              }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={customizeUrl}>Save</button>
              <button onClick={() => setShowRenameBox(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Bottom Share Buttons ---------- */}
      <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        {!isReadOnly && (
          <>
            <button onClick={copyEditableLink}>🔗 Editable Link</button>
            <button onClick={copyReadOnlyLink}>↗ Share Link</button>
          </>
        )}
        {isReadOnly && <button onClick={copyReadOnlyLink}>↗ Share Link</button>}
      </div>
    </div>
  );
}
