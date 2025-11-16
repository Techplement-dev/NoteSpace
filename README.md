📝 NoteSpace — Minimal Online Notepad (Next.js)

NoteSpace is a fast, simple, and minimal online notepad built using Next.js and MongoDB.
It allows users to create, edit, auto-save, and share notes instantly, each with a unique public URL.

The goal is to offer a smooth, no-login experience, similar to notepad.pw, while supporting advanced features like password protection and read-only links.

---

## 🚀 Features

### ✍️ Create & Edit Notes
A clean, distraction-free text editor.

### 🔄 Auto-Save
Notes automatically save every few seconds to keep your data safe.

### 🔗 Shareable URLs
Each note has a unique URL that can be shared publicly.

### 🔐 Password Protection
Secure your notes with a password.
Users must enter the correct password to view/edit.

### 👁️ Read-Only & Editable Links
Choose whether the shared link allows editing or only viewing.

### 🌙 Dark Mode
Toggle between light and dark themes for comfortable viewing.

### ⏳ Temporary Notes
Notes can expire automatically after:
- 1 minute
- 1 hour
- 1 day
- 7 days

---

## 🔐 Environment Variables (Required)

Create a `.env.local` file in the project root and add:

### **MongoDB Connection**

    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/notes

- This is your MongoDB Atlas connection string.
- It is used in `lib/dbConnect.ts` to connect Mongoose to your cluster.
- Never commit this file—Next.js automatically ignores `.env.local`.

### Optional future env variables:


## 🧩 Tech Stack

            | Layer                | Technology                             
    | -------------------- | ----------------------------------------- |
    | **Frontend**         | Next.js (App Router), React, TypeScript   |
    | **Styling**          | Tailwind CSS                              |
    | **Backend**          | Next.js API Routes (Serverless Functions) |
    | **Database**         | MongoDB (Mongoose ORM)                    |
    | **Hosting**          | Vercel                                    |
    | **Database Hosting** | MongoDB Atlas                             |
    | **Version Control**  | Git & GitHub                              |


🎯 Project Objectives

Build a minimal & clean UI for note editing

Implement auto-saving to MongoDB

Generate unique shareable URLs for every note

Allow public access without authentication

Provide password & read-only protection

Maintain fast, responsive performance across devices


## 📁 Folder Structure
    
    note-space/
    ├─ app/
    │  ├─ [id]/               # Dynamic note pages
    │  │  └─ NoteClient.tsx
    │  │  └─ page.tsx
    │  ├─ api/
    │  │  └─ notes/  # CRUD APIs for notes
    |  |  └─ [id]/
    |  |  └─ unlock               
    |  |     └─ route.ts
    |  |  └─ route.ts
    |  |  └─ new
    |  |     └─ route.ts
    │  │─ readonly/[id]
    |  |    └─ page.tsx
    │  ├─ globals.css
    │  └─ page.tsx
    ├─ lib/
    │  └─ dbConnect.ts
    ├─ models/
    │  └─ Note.ts
    ├─ .env.local
    ├─ eslint.config.mjs
    ├─ jsconfig.json
    ├─ tailwind.config.js
    ├─ next.config.ts
    ├─ package.json
    └─ README.md
    ├─ postcss.config.js
    ├─ tsconfig.json



⚙️ How It Works

🆔 Unique Note Creation

When a user visits /, a new note is automatically created

URL looks like: https://yourdomain.com/abc123

🔄 Auto-Save Logic

Every edit triggers a debounce timer

Saves the note every 2 seconds


🔒 Password Lock

User can set a password

Viewer must enter it to access the content


👁️ Read-Only Mode

_readonly=true parameter forces view-only mode

Editing disabled


## 🚀 Deployment

NoteSpace is deployed on **Vercel**, with both frontend and backend running via Next.js serverless API routes.

To deploy:
1. Push code to GitHub  
2. Import repo in Vercel  
3. Add environment variable in Vercel dashboard: MONGODB_URI=your-mongodb-uri
4. Deploy

---





