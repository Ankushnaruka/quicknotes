````markdown
# QuickNotes

QuickNotes is a full-stack web application for creating, organizing, and drawing on digital notes with multiple pages per note. It supports user authentication, persistent storage, and a rich drawing interface with pen, eraser, highlighter, and shape tools.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Frontend Functionality](#frontend-functionality)
- [Backend Functionality](#backend-functionality)
- [Data Model](#data-model)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

QuickNotes uses a **MERN-like architecture**:

- **Frontend:** Vanilla JavaScript, HTML, and CSS (no framework), located in `/frontend`.
- **Backend:** Node.js with Express, located in `/backend`.
- **Database:** MongoDB, storing user accounts and all notes data.
- **Data Flow:**  
  - The frontend communicates with the backend via REST API endpoints.
  - User notes (including all pages as image data URLs) are stored in the MongoDB database under each user document.

---

## Features

- **User Authentication:** Register and log in with username, email, and password.
- **Note Management:** Create, rename, and delete notes.
- **Multi-Page Notes:** Each note can have multiple pages (canvases).
- **Drawing Tools:** Pen, eraser, highlighter, and shape tools (rectangle, circle, line).
- **Full-Screen Drawing:** Toggle full-screen mode for distraction-free drawing.
- **Persistent Storage:** All notes and drawings are saved to the database and loaded on login.
- **Responsive UI:** Sidebar for notes, main area for drawing, and toolbars for controls.

---

## Folder Structure

```
quicknotes/
│
├── backend/
│   ├── app.js              # Express server and API routes
│   └── models/
│       └── UserSchema.js   # Mongoose user schema
│
├── frontend/
│   ├── home/
│   │   ├── home.html       # Main app UI
│   │   ├── home.js         # Drawing and note logic
│   │   └── home.css        # Styles
│   └── login/
│       ├── login.html      # Login/register UI
│       └── login.js        # Auth logic
│
└── README.md
```

---

## Frontend Functionality

- **Note Sidebar:** Lists all notes for the logged-in user. Clicking a note loads all its pages.
- **Canvas Area:** Displays all pages (canvases) of the selected note, scrollable vertically.
- **Drawing Tools:** Select pen, eraser, highlighter, or shapes. Adjust pen width and color.
- **Add Page:** Add a new blank page to the current note.
- **Save:** Saves all notes and their pages to the backend.
- **Load:** On login or page load, fetches all notes and restores canvases from the backend.

---

## Backend Functionality

- **User Management:** Handles registration and login.
- **Notes API:**
  - `/updatefolder` (POST): Saves all notes for a user.
  - `/getfolder` (GET): Loads all notes for a user.
- **Data Storage:** Each user document contains a `folder` array with all notes, each note containing an array of page images (as data URLs).

---

## Data Model

**User Document Example:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "hashedpassword",
  "folder": [
    {
      "id": "note_1716300000000",
      "title": "Physics Notes",
      "pages": [
        "data:image/png;base64,...", // Page 1
        "data:image/png;base64,...", // Page 2
        // ...
      ]
    },
    // more notes...
  ]
}
```

---

## How to Run

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/quicknotes.git
   cd quicknotes
   ```

2. **Install backend dependencies:**
   ```
   cd backend
   npm install
   ```

3. **Set up MongoDB:**
   - Make sure MongoDB is running.
   - Set your connection string in `backend/app.js` (`mongoURI`).

4. **Start the backend server:**
   ```
   node app.js
   ```

5. **Open the frontend:**
   - Open `frontend/home/home.html` in your browser (or use a local server for CORS).

---

## API Endpoints

- **POST `/updatefolder`**
  - Body: `{ username, notes }`
  - Saves all notes for the user.

- **GET `/getfolder?username=USERNAME`**
  - Returns: `{ notes: [...] }`
  - Loads all notes for the user.

---

## Troubleshooting

- **CORS Errors:** Make sure both `localhost` and `127.0.0.1` are allowed in backend CORS settings.
- **Payload Too Large:** If you get a 413 error, increase the `express.json({ limit: '50mb' })` limit.
- **Notes Not Loading:** Ensure you are saving and loading notes for the same username, and that the backend returns the correct data structure.
- **No Notes Displayed:** Make sure you have created and saved at least one note.

---

## License

MIT License

---

**QuickNotes** – Your digital notebook for handwritten, multi-page notes!
````