# QuickNotes

QuickNotes is a full-stack web application for creating, organizing, and drawing on digital notes with multiple pages per note. It features user authentication with JWT, persistent storage, and a rich drawing interface. The project is designed for extensibility, with future plans for collaborative features and social note sharing.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [JWT Authentication Explained](#jwt-authentication-explained)
- [Data Model](#data-model)
- [How to Run](#how-to-run)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Future Upgrades](#future-upgrades)
- [License](#license)

---

## Project Overview

QuickNotes allows users to:
- Register and log in securely.
- Create, rename, and delete notes.
- Draw on multiple pages per note using various tools (pen, eraser, highlighter, shapes).
- Save and load notes with all drawings and pages preserved.
- Enjoy a responsive and intuitive UI.

---

## Architecture Overview

QuickNotes uses a **MERN-like architecture** (MongoDB, Express, React-like structure, Node.js), but the frontend is built with vanilla JavaScript, HTML, and CSS for simplicity and flexibility.

**Main Components:**
- **Frontend:** Vanilla JS, HTML, CSS (in `/frontend`)
- **Backend:** Node.js with Express (in `/backend`)
- **Database:** MongoDB (Atlas or local)
- **Authentication:** JWT (JSON Web Token) for secure, stateless user sessions

---

## Project Structure

```
quicknotes/
│
├── backend/
│   ├── app.js                # Express server, API routes, JWT middleware
│   └── models/
│       └── UserSchema.js     # Mongoose user schema
│
├── frontend/
│   ├── home/
│   │   ├── home.html         # Main app UI
│   │   ├── home.js           # Drawing and note logic
│   │   └── home.css          # Styles
│   └── login/
│       ├── login.html        # Login/register UI
│       └── login.js          # Auth logic
│
├── .gitignore                # Git ignore rules (node_modules, .env, etc.)
├── README.md                 # Project documentation
└── package.json              # Project metadata (if using npm at root)
```

---

## Features

- **User Authentication:** Secure registration and login with JWT.
- **Note Management:** Create, rename, and delete notes.
- **Multi-Page Notes:** Each note can have multiple drawing canvases (pages).
- **Drawing Tools:** Pen, eraser, highlighter, and shape tools.
- **Full-Screen Drawing:** Distraction-free drawing mode.
- **Persistent Storage:** Notes and drawings are saved in MongoDB.
- **Responsive UI:** Sidebar for notes, main area for drawing, toolbars for controls.

---

## JWT Authentication Explained

### What is JWT?

JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties. In QuickNotes, JWT is used for **stateless authentication**.

### How JWT Works in QuickNotes

1. **Login:**
   - User submits username and password.
   - Backend verifies credentials.
   - If valid, backend creates a JWT containing the user's username and ID, signs it with a secret key, and sends it to the frontend.

2. **Frontend Storage:**
   - The frontend stores the JWT in `localStorage`.

3. **Authenticated Requests:**
   - For protected API calls (like saving/loading notes), the frontend sends the JWT in the `Authorization` header:
     ```
     Authorization: Bearer <token>
     ```

4. **Backend Verification:**
   - The backend uses a middleware (`authenticateToken`) to check for the JWT in the request.
   - If the token is valid, the backend extracts the user info and allows access.
   - If invalid or missing, the backend returns a 401/403 error.

### Example JWT Middleware

```javascript
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
```

**Why JWT?**
- Stateless: No need to store sessions on the server.
- Secure: Only the server knows the secret key.
- Scalable: Works well for APIs and distributed systems.

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
    }
    // more notes...
  ]
}
```

---

## How to Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/quicknotes.git
   cd quicknotes
   ```

2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in `/backend`:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_super_secret_key
     ```

4. **Start the backend server:**
   ```sh
   node app.js
   ```

5. **Open the frontend:**
   - Open `frontend/home/home.html` in your browser (or use a local server for CORS).

---

## API Endpoints

- **POST `/users`**  
  Register a new user.

- **POST `/login`**  
  Log in and receive a JWT token.

- **POST `/updatefolder`** (protected)  
  Save all notes for the authenticated user.

- **GET `/getfolder`** (protected)  
  Load all notes for the authenticated user.

---

## Troubleshooting

- **CORS Errors:**  
  Ensure both `localhost` and `127.0.0.1` are allowed in backend CORS settings.

- **Payload Too Large:**  
  If you get a 413 error, increase the `express.json({ limit: '50mb' })` limit.

- **JWT 401/403 Errors:**  
  Make sure the frontend sends the token in the `Authorization` header and that the token is valid.

- **Notes Not Loading:**  
  Ensure you are saving and loading notes for the same user, and that the backend returns the correct data structure.

- **No Notes Displayed:**  
  Make sure you have created and saved at least one note.

---

## Future Upgrades

Planned features for future releases:

- **Collections:**  
  Users will be able to create collections to organize and collect notes from various users, enabling collaborative study and resource sharing.

- **Explore & Social Features:**  
  - Connect with other users.
  - Publish notes publicly or within groups.
  - Browse, like, and comment on public notes.
  - Follow users and build a learning network.

These features will transform QuickNotes from a personal note-taking app into a collaborative and social platform for sharing knowledge.

---

## License

MIT License

---

**QuickNotes** – Your digital notebook for handwritten, multi-page notes, with secure authentication and a vision for collaborative learning!
