# NodeSocial

A full-stack social media platform built with a **GraphQL API** backend and a **React** frontend. Users can sign up, log in, create posts with image uploads, and manage their own content — all secured with JWT authentication.

**Live Demo:** [node-social-chi.vercel.app](https://node-social-chi.vercel.app)  
**API:** [node-social-zmra.onrender.com/graphql](https://node-social-zmra.onrender.com/graphql)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [GraphQL API](#graphql-api)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Features

- **Authentication** — Sign up and log in with hashed passwords (bcryptjs). JWT tokens are issued on login and expire after 1 hour, with automatic client-side logout.
- **Post Management** — Create, read, update, and delete posts with a title, content, and image. Only the post's creator can edit or delete it.
- **Image Uploads** — Server-side file handling with Multer; accepts PNG, JPG, and JPEG. Deleted posts automatically clean up their associated images.
- **User Status** — Each user has an editable status message (defaults to "I am new!").
- **Pagination** — Posts are fetched 2 per page, sorted by newest first.
- **Real-time Updates** — Socket.io is wired in for live communication between clients.
- **GraphiQL IDE** — Interactive API explorer available at `/graphql` during development.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| API | GraphQL (`express-graphql`) |
| Database | MongoDB (Atlas) via Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | bcryptjs |
| File Uploads | Multer + Cloudinary |
| Real-time | Socket.io |
| Frontend | React 16 (Create React App) |
| Routing (Frontend) | React Router v4 |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Project Structure

```
NodeSocial/
├── Backend/
│   ├── app.js                  # Entry point — Express, GraphQL, middleware, DB connection
│   ├── graphql/
│   │   ├── schema.js           # GraphQL types, queries, and mutations
│   │   └── resolvers.js        # Business logic for each GraphQL operation
│   ├── models/
│   │   ├── user.js             # Mongoose User model
│   │   └── post.js             # Mongoose Post model (timestamps enabled)
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware (sets req.isAuth, req.userId)
│   └── images/                 # Uploaded images (gitignored, directory preserved)
├── App/
│   └── src/
│       ├── App.js              # Root component — auth state, routing, GraphQL calls
│       ├── pages/
│       │   ├── Auth/           # Login and Signup pages
│       │   └── Feed/           # Post feed and single post view
│       └── components/         # Reusable UI components
└── util/
    └── file.js                 # Shared image cleanup utility
```

---

## GraphQL API

The API is exposed at `POST /graphql`. Authenticated requests must include an `Authorization: Bearer <token>` header.

### Queries

| Query | Auth Required | Description |
|---|---|---|
| `login(email, password)` | No | Returns a JWT token and user ID |
| `getPosts(page)` | Yes | Returns paginated posts (2 per page) and total count |
| `getPost(id)` | Yes | Returns a single post by ID |
| `user` | Yes | Returns the current authenticated user's data |

### Mutations

| Mutation | Auth Required | Description |
|---|---|---|
| `createUser(userInput)` | No | Registers a new user |
| `createPost(postInput)` | Yes | Creates a new post |
| `updatePost(id, postInput)` | Yes (creator only) | Updates an existing post |
| `deletePost(id)` | Yes (creator only) | Deletes a post and its image |
| `updateStatus(status)` | Yes | Updates the current user's status message |

### Image Upload

Images are uploaded via a separate REST endpoint before submitting a post:

```
POST /post-image
Content-Type: multipart/form-data
Body: image (file field)
```

Returns the image URL to include in the post mutation.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local MongoDB instance)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mohamedzeina/NodeSocial.git
   cd NodeSocial
   ```

2. **Install backend dependencies:**

   ```bash
   cd Backend
   npm install
   ```

3. **Install frontend dependencies:**

   ```bash
   cd ../App
   npm install --legacy-peer-deps
   ```

4. **Configure environment variables** — see [Environment Variables](#environment-variables) below.

5. **Run both servers** (in separate terminals):

   ```bash
   # Terminal 1 — Backend (port 8080)
   cd Backend
   npm start

   # Terminal 2 — Frontend (port 3000)
   cd App
   npm start
   ```

6. **Access the app:**
   - Frontend: `http://localhost:3000`
   - GraphiQL IDE: `http://localhost:8080/graphql`

---

## Environment Variables

The backend reads its configuration from a `nodemon.json` file in the `Backend/` directory (this file is gitignored). Create it before starting the server:

```json
{
  "env": {
    "MONGODB_URI": "your-mongodb-connection-string",
    "JWT_SECRET": "a-long-random-secret-string",
    "CLOUDINARY_CLOUD_NAME": "your-cloud-name",
    "CLOUDINARY_API_KEY": "your-api-key",
    "CLOUDINARY_API_SECRET": "your-api-secret"
  }
}
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Full MongoDB connection string (e.g. from MongoDB Atlas) |
| `JWT_SECRET` | Secret used to sign and verify JWT tokens — keep this private |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (from the Cloudinary dashboard) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret — keep this private |
