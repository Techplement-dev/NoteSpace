"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {FiLock, FiPlus, FiUnlock, FiSave, FiX, FiLink2, FiShare2, FiClock } from "react-icons/fi";

export default function NoteClient({
  noteId,
  isReadOnly = false,
}: {
  noteId: string;
  isReadOnly?: boolean
})  {
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
  const [darkMode, setDarkMode] = useState(true);
  const [expiryTime, setExpiryTime] = useState<string>("never");
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

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

  const copyEditableLink = async () => {
  if (typeof window === "undefined" || !navigator?.clipboard) {
    console.error("Clipboard API not available");
    alert("❌ Clipboard not supported in this environment.");
    return;
  }

  try {
    await navigator.clipboard.writeText(`${window.location.origin}/${noteId}`);
    alert("✅ Editable link copied!");
  } catch (error) {
    console.error("Failed to copy link:", error);
    alert("❌ Unable to copy link. Please try manually.");
  }
};

 const copyReadOnlyLink = async () => {
  if (typeof window === "undefined" || !navigator?.clipboard) {
    console.error("Clipboard API not available");
    alert("❌ Clipboard not supported in this environment.");
    return;
  }

  try {
    await navigator.clipboard.writeText(`${window.location.origin}/readonly/${noteId}`);
    alert("✅ Read-only link copied!");
  } catch (error) {
    console.error("Failed to copy link:", error);
    alert("❌ Unable to copy link. Please try manually.");
  }
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
      className={`
    flex flex-col justify-center items-center w-[100%] min-h-screen
    px-[5%] py-5 font-inter transition-all duration-300 relative
    ${darkMode
      ? "bg-[#111827] text-gray-100 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%)]"
      : "bg-gray-50 text-gray-900 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.05),transparent_40%)]"
    }
  `}
    >


 {/*Top Bar */}
<div
  className={`
    w-[95%] max-w-[1100px]
    flex items-center justify-between flex-wrap
    gap-3 mb-4 py-3
    border-b-2 transition-all duration-300
    font-inter
    ${darkMode ? "border-purple-700" : "border-purple-400"}
  `}
>
  {/* Title */}
  <h2
   className={`
    flex items-center justify-center sm:justify-start
    gap-2 text-[1.6rem] font-bold tracking-wide
    ${darkMode ? "text-gray-200" : "text-gray-900"}
    text-center sm:text-left w-full sm:w-auto
    transition-all duration-300
  `}
  >
    📝 NoteSpace
  </h2>

  {/* Right Controls */}
  <div
    className="
      flex flex-wrap items-center justify-center sm:justify-end
      gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0
    "
  >
    {saving && (
      <span
        className={`
          text-sm font-medium
          ${darkMode ? "text-gray-400" : "text-gray-600"}
        `}
      >
        Saving...
      </span>
    )}

    {saved && (
      <span className="text-sm font-medium text-green-500">
        ✓ Saved ({lastSaved})
      </span>
    )}

    {!isReadOnly && (
     <>
  <div
    className="
      flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end
      gap-2 sm:gap-3 w-full
    "
  >
    {/* Set Password Button */}
    <button
      onClick={() => setShowPasswordPrompt(true)}
      className="
        bg-gradient-to-r from-indigo-500 to-purple-800
        text-white font-semibold text-[12px] px-4 py-2 rounded-lg shadow-md
        hover:-translate-y-[2px] hover:shadow-lg
        transition-all duration-200 flex-1 sm:flex-none text-center
      "
    >
      🔒 Set Password
    </button>

    {/* Customize URL Button */}
    <button
      onClick={() => setShowRenameBox(true)}
      className="
        bg-gradient-to-r from-indigo-500 to-purple-800
        text-white font-semibold text-[12px] px-4 py-2 rounded-lg shadow-md
        hover:-translate-y-[2px] hover:shadow-lg
        transition-all duration-200 flex-1 sm:flex-none text-center
      "
    >
      ✏️ Customize URL
    </button>

    <div
  onClick={createNewNote}
  className="
    hidden md:flex items-center gap-2 md:gap-3
    px-2 py-1 rounded-lg
    border border-purple-500/30
    bg-gradient-to-r from-purple-500/10 to-indigo-500/10
    hover:from-purple-500/20 hover:to-indigo-500/20
    backdrop-blur-md
    shadow-sm hover:shadow-lg
    transition-all duration-300 ease-in-out
    cursor-pointer
    hover:scale-[1.03]
    active:scale-[0.97]
  "
>
  {/* “New Note” text visible only on md+ screens */}
  <span
    className={`
      font-semibold text-sm md:text-[15px] tracking-wide
      transition-colors duration-300
      ${darkMode ? "text-gray-100" : "text-gray-800"}
    `}
  >
    New Note
  </span>

  {/* New Note Button */}
  <span
    title="New Note"
    className="
      flex items-center justify-center
      w-[28px] h-[28px] rounded-full
      bg-gradient-to-r from-purple-500 to-indigo-500
      text-white shadow-md hover:shadow-xl
      transition-all duration-300
    "
  >
    <FiPlus className="text-[18px]" />
  </span>
</div>

    {/* Theme Toggle Icon */}
    <span
      onClick={() => setDarkMode(!darkMode)}
      title="Toggle Dark/Light Mode"
      className={`
        cursor-pointer text-[22px] transition-transform duration-200
        ${darkMode ? "text-yellow-400 hover:scale-110" : "text-gray-500 hover:scale-110"}
      `}
    >
      {darkMode ? "🌞" : "🌙"}
    </span>
  </div>
</>
    )}
  </div>
</div>


      {/* Text Area  */}
<div
 className={`
  w-[95%] max-w-[1000px] h-[75vh]
  border rounded-[14px] overflow-hidden relative
  flex flex-col transition-all duration-300 backdrop-blur-md
  p-0
  ${darkMode
    ? "bg-[#121212] border-[#2f2f2f] shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
    : "bg-white border-gray-200 shadow-[0_6px_16px_rgba(0,0,0,0.1)]"
  }
`}

>
  <textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder={
    isLocked ? "🔒 This note is protected" : "Start typing your note..."
  }
  readOnly={isLocked || isReadOnly}
  className={`
    flex-1 w-full h-full resize-none
    border-none outline-none
    p-6 text-[16px] leading-[1.7] tracking-[0.3px]
    font-['Fira_Code','Source_Code_Pro',Consolas,monospace]
    overflow-y-auto transition-all duration-300 ease-in-out
    scrollbar-thin
    ${
      darkMode
        ? "bg-[#121212] text-[#f4f4f5] scrollbar-thumb-[#6d28d9] scrollbar-track-[#1f1f1f]"
        : "bg-white text-[#1f2937] scrollbar-thumb-[#8b5cf6] scrollbar-track-[#f3f4f6]"
    }
  `}
/>


  {/* Show timer only if expiry is not "never" */}
 {expiryTimestamp && timeLeft && (
  <div
    className={`
      absolute bottom-3 right-4 flex items-center gap-1.5
      text-[13.5px] font-medium rounded-lg px-3 py-1.5 shadow-[0_2px_5px_rgba(0,0,0,0.1)]
      border transition-all duration-300
      ${
        darkMode
          ? "text-gray-300 bg-[#1f1f1f] border-[rgba(99,102,241,0.2)]"
          : "text-gray-600 bg-gray-100 border-[rgba(139,92,246,0.2)]"
      }
    `}
  >
    ⏳ <span>{timeLeft}</span>
  </div>
)}

</div>

    {/* New Note Button + Text */}

<div
  onClick={createNewNote}
  className="
    flex items-center gap-2 md:gap-3
    px-2 py-1 rounded-lg
    border border-purple-500/30
    bg-gradient-to-r from-purple-500/10 to-indigo-500/10
    hover:from-purple-500/20 hover:to-indigo-500/20
    backdrop-blur-md
    shadow-sm hover:shadow-lg
    transition-all duration-300 ease-in-out
    cursor-pointer
    hover:scale-[1.03]
    active:scale-[0.97]
    mt-10
  "
>
  {/* “New Note” text visible only on md+ screens */}
  <span
    className={`
      font-semibold text-sm md:text-[15px] tracking-wide
      transition-colors duration-300
      ${darkMode ? "text-gray-100" : "text-gray-800"}
    `}
  >
    New Note
  </span>

  {/* New Note Button */}
  <span
    title="New Note"
    className="
      flex items-center justify-center
      w-[28px] h-[28px] rounded-full
      bg-gradient-to-r from-purple-500 to-indigo-500
      text-white shadow-md hover:shadow-xl
      transition-all duration-300
    "
  >
    <FiPlus className="text-[18px]" />
  </span>
</div>


      {/* Bottom Section */}

   <div
  className={`
    mt-4 flex flex-wrap items-center justify-start gap-3 py-2.5
    font-inter
  `}
>
  {!isReadOnly && (
    <>
      {/* Editable Link Button */}
      <button
        onClick={copyEditableLink}
        className={`
          flex items-center justify-center gap-1.5
          bg-transparent border-b-2 border-purple-500
          text-purple-500 font-semibold text-[15px]
          py-2 cursor-pointer min-w-[140px] flex-1
          transition-all duration-200 hover:text-purple-700
        `}
      >
        <FiLink2 size={18} /> Editable Link
      </button>

      {/* Share Link Button */}
      <button
        onClick={copyReadOnlyLink}
        className={`
          flex items-center justify-center gap-1.5
          bg-transparent border-b-2 border-purple-500
          text-purple-500 font-semibold text-[15px]
          py-2 cursor-pointer min-w-[140px] flex-1
          transition-all duration-200 hover:text-purple-700
        `}
      >
        <FiShare2 size={18} /> Share Link
      </button>

     {/* Expiry Section Wrapper */}
<div
  className="
    flex items-center justify-center sm:justify-start gap-2 sm:gap-3
    w-full sm:w-auto flex-wrap sm:flex-nowrap
  "
>
  {/* Expiry Label */}
  <label
    className={`
      flex items-center ml-20 md:m-0 justify-center gap-1.5 text-[15px] font-medium
      text-purple-500
      flex-auto sm:flex-none
    `}
  >
    <FiClock size={18} className="text-purple-500" />
    Expire in
  </label>

  {/* Dropdown */}
  <select
    value={expiryTime}
    onChange={(e) => handleExpiryChange(e.target.value)}
    className={`
      px-3 py-2 rounded-md border-b-2 border-purple-500
      text-[15px] cursor-pointer outline-none
      transition-colors duration-300
      font-bold
      flex-none min-w-[120px] sm:w-[150px]
      md:m-0 mr-10
      ${
        darkMode
          ? "bg-[#2b2b2b] text-purple-800 focus:border-purple-700 bg-transparent"
          : "bg-gray-100 text-gray-800 focus:border-purple-700"
      }
    `}
  >
    <option value="never" className="text-white">Never</option>
    <option value="1m">1 minute</option>
    <option value="1h">1 hour</option>
    <option value="1d">1 day</option>
    <option value="7d">7 days</option>
  </select>
</div>

    </>
  )}
</div>


      {/* Password Modal */}
      {showPasswordPrompt && (
  <div
    className="
      fixed inset-0 z-[1000] flex items-center justify-center
      bg-black/50 backdrop-blur-md p-5
    "
  >
    <div
      className={`
        w-full max-w-md rounded-2xl p-8 text-center transition-all duration-300
        shadow-[0_8px_30px_rgba(0,0,0,0.25)]
        ${darkMode ? "bg-[#1e1e1e] text-gray-100" : "bg-white text-gray-900"}
      `}
    >
      {/* Heading */}
      <h3
        className={`
          mb-5 text-[20px] font-semibold flex items-center justify-center gap-2
          ${darkMode ? "text-gray-100" : "text-gray-800"}
        `}
      >
        {isLocked ? (
          <>
            <FiUnlock/> Unlock Note
          </>
        ) : (
          <>
            <FiLock /> Set Password
          </>
        )}
      </h3>

      {/* Input Field */}
      <div className="relative w-full flex justify-center">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`
            w-[70%] py-3 px-4 pr-10 rounded-lg text-[15px] outline-none transition-all duration-200
            ${darkMode 
              ? "bg-[#2a2a2a] border border-[#444] text-gray-200 focus:border-purple-500" 
              : "bg-gray-50 border border-gray-300 text-gray-900 focus:border-purple-500"
            }
          `}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className={`
            absolute mr-5 right-[15%] top-1/2 -translate-y-1/2 cursor-pointer text-[20px]
            ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}
            transition-colors
          `}
        >
          {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </span>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          onClick={() => (isLocked ? unlockNote() : lockNote())}
          className="
            flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-purple-500
            hover:brightness-110 transition-all duration-200
            hover:-translate-y-[2px],
          "
        >
          {isLocked ? <FiUnlock /> : <FiLock />}
          {isLocked ? "Unlock" : "Save"}
        </button>

        <button
          onClick={() => setShowPasswordPrompt(false)}
          className={`
            flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors duration-200
            ${darkMode 
              ? "bg-[#333] text-white hover:bg-[#444]" 
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }
          `}
        >
          <FiX /> Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/*  Rename Modal */}
      
     {showRenameBox && (
  <div
    className="
      fixed inset-0 z-[1000] flex items-center justify-center 
      bg-black/50 backdrop-blur-md p-5
    "
  >
    <div
      className={`
        w-full max-w-md rounded-2xl p-8 text-center transition-all duration-300
        shadow-[0_8px_30px_rgba(0,0,0,0.25)]
        ${darkMode ? "bg-[#1e1e1e] text-gray-100" : "bg-white text-gray-900"}
      `}
    >
      <h3
        className={`
          mb-5 text-[20px] font-semibold
          ${darkMode ? "text-gray-100" : "text-gray-800"}
        `}
      >
        Customize URL
      </h3>

      {/* Input Field */}
      <div className="relative w-full flex justify-center">
        <input
          type={showUrl ? "text" : "password"}
          placeholder="Enter new URL name"
          value={newUrlName}
          onChange={(e) => setNewUrlName(e.target.value)}
          className={`
            w-[80%] py-3 px-4 pr-10 rounded-lg border
            text-[15px] outline-none transition-all duration-200
            ${darkMode 
              ? "bg-[#2a2a2a] border-[#444] text-gray-200 focus:border-purple-500"
              : "bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500"
            }
          `}
        />
        <span
          onClick={() => setShowUrl(!showUrl)}
          className={`
            absolute  mr-5 right-[10%] top-1/2 -translate-y-1/2 cursor-pointer text-[20px]
            ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}
            transition-colors
          `}
        >
          {showUrl ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
        </span>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button
          onClick={customizeUrl}
          className="
            flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white
            bg-gradient-to-r from-indigo-500 to-purple-500
            hover:brightness-110 transition-all duration-200
            hover:-translate-y-[2px]
          "
        >
          <FiSave /> Save
        </button>

        <button
          onClick={() => setShowRenameBox(false)}
          className={`
            flex-1 flex items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors duration-200
            ${darkMode 
              ? "bg-[#333] text-white hover:bg-[#444]" 
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }
          `}
        >
          <FiX /> Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}