
"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NoteClient({ noteId }: { noteId: string }) {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showRenameBox, setShowRenameBox] = useState(false);
  const [newUrlName, setNewUrlName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [expiryTime, setExpiryTime] = useState<string>("never");
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const isReadOnly = searchParams.get("readonly") === "true";

  //  Fetch note 

  useEffect(() => {
    if (!noteId) return;
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (res.status === 401) {
          alert("🔒 This note is password protected. Please enter the password.");
          setIsLocked(true);
          setShowPasswordPrompt(true);
          return;
        }
        if (res.status === 403) {
          alert("❌ Incorrect password!");
          router.push("/");
          return;
        }
        if (res.status === 404) {
          alert("⚠️ Note not found! It may have been deleted or renamed.");
          router.push("/");
          return;
        }
        if (res.status === 410) {
          alert("🗑️ This note has expired and was deleted.");
          router.push("/");
          return;
        }
        if (!res.ok) throw new Error("Unexpected response");

        const data = await res.json();
        if (data.note) {
          setContent(data.note.content || "");
          setIsLocked(!!data.note.password);

          // Fix countdown: Only set if expiresAt exists

          if (data.note.expiresAt) {
            const expTime = new Date(data.note.expiresAt).getTime();
            setExpiryTimestamp(expTime);
            setExpiryTime("custom");
          } else {
            setExpiryTimestamp(null);
            setExpiryTime("never");
          }
        }
      } catch (err) {
        console.error("Failed to fetch note:", err);
        alert("⚠️ Could not fetch note. Try again later.");
        router.push("/");
      }
    };
    fetchNote();
  }, [noteId, router]);

  //Auto-save

  useEffect(() => {
    if (!noteId || isReadOnly || isLocked) return;
    if (expiryTimestamp && expiryTimestamp <= Date.now()) return;

    const timeout = setTimeout(async () => {
      try {
        setSaving(true);
        setSaved(false);
        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          if (res.status === 404 || res.status === 410) {
            alert("🗑️ This note no longer exists or has expired.");
            router.push("/");
            return;
          }
          throw new Error(`Failed to save (${res.status})`);
        }

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
  }, [content, noteId, isReadOnly, isLocked, expiryTimestamp, router]);

  // Create new note 

  const createNewNote = async () => {
    try {
      const res = await fetch("/api/notes/new", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create new note");
      const data = await res.json();
      if (data.id) window.open(`/${data.id}`, "_blank");
    } catch (err) {
      console.error("Error creating new note:", err);
    }
  };

  // Password

  const lockNote = async () => {
    if (!password) return alert("Please enter a password.");
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },

        // Hashing done in backend — only send plain once

        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Failed to set password");
      alert("🔒 Password set successfully!");
      setShowPasswordPrompt(false);
      setPassword("");
    } catch (err) {
      console.error("Error locking note:", err);
    }
  };

  const unlockNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}?password=${password}`);
      const data = await res.json();
      if (res.status === 200 && data.note) {
        setContent(data.note.content || "");
        setIsLocked(false);
        setShowPasswordPrompt(false);
        setPassword("");

        // restore expiry timer

        if (data.note.expiresAt)
          setExpiryTimestamp(new Date(data.note.expiresAt).getTime());
      } else alert(data.error || "❌ Incorrect password");
    } catch (err) {
      console.error("Error unlocking note:", err);
    }
  };

  //Share Links 

  const copyEditableLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${noteId}`);
    alert("✅ Editable link copied!");
  };
  const copyReadOnlyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${noteId}?readonly=true`);
    alert("🔗 Read-only link copied!");
  };

  //Customize URL 

  const customizeUrl = async () => {
    if (!newUrlName) return alert("Enter a valid name.");
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
    } catch (err) {
      alert("❌ " + err);
    }
  };

  // Expiry Timer 

  const handleExpiryChange = async (value: string) => {
    setExpiryTime(value);
    let newExpiryTimestamp: number | null = null;
    if (value === "1m") newExpiryTimestamp = Date.now() + 60000;
    else if (value === "1h") newExpiryTimestamp = Date.now() + 3600000;
    else if (value === "1d") newExpiryTimestamp = Date.now() + 86400000;
    else if (value === "7d") newExpiryTimestamp = Date.now() + 604800000;
    else if (value === "never") newExpiryTimestamp = null;

    setExpiryTimestamp(newExpiryTimestamp);
    await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiryTimestamp: newExpiryTimestamp }),
    });
  };

  //Countdown 

  useEffect(() => {
    if (!expiryTimestamp) {
      setTimeLeft("");
      return;
    }
    const updateCountdown = () => {
      const remaining = expiryTimestamp - Date.now();
      if (remaining <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        alert("🗑️ This note has expired!");
        router.push("/");
        return;
      }
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp, router]);

  //UI

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#1e1e1e" : "#f8f9fb",
        color: darkMode ? "#eee" : "#333",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >

{/* Its fix  */}

      {/*Top Bar */}

      <div
        style={{
          width: "85%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ color: darkMode ? "#ddd" : "#444", fontWeight: "500" }}>📝 NoteSpace</h2>

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

              <span
                onClick={() => setDarkMode(!darkMode)}
                style={{ cursor: "pointer", fontSize: "20px" }}
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? "🌞" : "🌙"}
              </span>

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
                }}
                title="New Note"
              >
                ＋
              </span>
            </>
          )}
        </div>
      </div>

      {/* Text Area  */}

      <div
        style={{
          backgroundColor: darkMode ? "#2b2b2b" : "#fff",
          width: "85%",
          height: "80%",
          border: "1px solid #ddd",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isLocked ? "🔒 Protected note" : "Start typing..."}
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
            color: darkMode ? "#eee" : "#333",
            backgroundColor: darkMode ? "#2b2b2b" : "#fff",
          }}
        />

        {/*Show timer only if expiry is not "never" */}

        {expiryTimestamp && timeLeft && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              right: "12px",
              color: darkMode ? "#bbb" : "#666",
              fontSize: "13px",
            }}
          >
            ⏳ {timeLeft}
          </div>
        )}
      </div>

      {/* Bottom Section */}

      <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
        {!isReadOnly && (
          <>
            <button onClick={copyEditableLink}>🔗 Editable Link</button>
            <button onClick={copyReadOnlyLink}>↗ Share Link</button>

            <label> ⏱️Expire in </label>
            <select
              value={expiryTime}
              onChange={(e) => handleExpiryChange(e.target.value)}
              style={{ padding: "4px", borderRadius: "4px" }}
            >
              <option value="never">Never</option>
              <option value="1m">1 minute</option>
              <option value="1h">1 hour</option>
              <option value="1d">1 day</option>
              <option value="7d">7 days</option>
            </select>
          </>
        )}
      </div>

      {/* Password Modal */}

      {showPasswordPrompt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: darkMode ? "#2b2b2b" : "#fff",
              padding: "30px",
              borderRadius: "16px",
              width: "360px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "18px", fontWeight: 600, fontSize: "18px" }}>
              {isLocked ? "Unlock Note" : "Set Password"}
            </h3>

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  background: darkMode ? "#1f1f1f" : "#fafafa",
                  color: darkMode ? "#eee" : "#333",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: darkMode ? "#bbb" : "#666",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                gap: "10px",
              }}
            >
              <button
                onClick={() => (isLocked ? unlockNote() : lockNote())}
                style={{
                  flex: 1,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {isLocked ? "Unlock" : "Save"}
              </button>

              <button
                onClick={() => setShowPasswordPrompt(false)}
                style={{
                  flex: 1,
                  background: darkMode ? "#444" : "#e5e7eb",
                  color: darkMode ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Rename Modal */}
      
      {showRenameBox && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: darkMode ? "#2b2b2b" : "#fff",
              padding: "30px",
              borderRadius: "16px",
              width: "360px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "18px", fontWeight: 600, fontSize: "18px" }}>
              Customize URL
            </h3>

            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showUrl ? "text" : "password"}
                placeholder="Enter new URL name"
                value={newUrlName}
                onChange={(e) => setNewUrlName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  background: darkMode ? "#1f1f1f" : "#fafafa",
                  color: darkMode ? "#eee" : "#333",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
              <span
                onClick={() => setShowUrl(!showUrl)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: darkMode ? "#bbb" : "#666",
                }}
              >
                {showUrl ? "🙈" : "👁️"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                gap: "10px",
              }}
            >
              <button
                onClick={customizeUrl}
                style={{
                  flex: 1,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Save
              </button>

              <button
                onClick={() => setShowRenameBox(false)}
                style={{
                  flex: 1,
                  background: darkMode ? "#444" : "#e5e7eb",
                  color: darkMode ? "#fff" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 0",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}