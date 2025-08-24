# NodeSocial

Welcome to the **NodeSocial** repository! This project is a GraphQL-powered social media platform built with Node.js. It supports core social features such as user authentication, post creation, and post management — all handled through a clean API architecture with JWT-based security.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)

## Features

- **User Authentication**
  - Sign up and login with secure credential handling.
  - JWT token generation upon login (valid for 1 hour).
  - Protected routes using token verification via request headers.

- **Post Management**
  - Create a post (title, content, image upload) — requires authentication.
  - Edit or delete your own posts — requires authentication.
  - View all posts across the platform (public access).

- **GraphQL API**
  - All interactions handled via GraphQL queries and mutations.
  - Modular resolver structure for scalability and separation of concerns.

## Tech Stack

- **Backend:** Node.js, Express.js
- **API Layer:** GraphQL using `express-graphql`
- **Authentication:** JSON Web Tokens (JWT)
- **Database:** MongoDB with Mongoose
- **File Uploads:** Multer for image uploads


## Architecture

This project follows a modular, API-first architecture:

- **GraphQL Schema:** Defines types, queries, and mutations for users and posts.
- **Resolvers:** Handle business logic for each GraphQL operation.
- **Authentication:** JWT middleware used to protect and authorize sensitive operations.
- **Database Layer:** MongoDB collections defined via Mongoose models.

## Installation

1. Clone the repository:
   
   ```bash
   git clone https://github.com/mohamedzeina/NodeSocial.git
   cd NodeSocial
   ```
2. Install dependencies for both backend and frontend:
   
   ```bash
    cd backend
    npm install --legacy-peer-deps

    cd ../app
    npm install 
   ```
3. Set up your environment variables:
   In the backend/ folder, create a nodemon.json file and add the following:
   
   ```json
    {
      "env": {
        "MONGODB_URI": "your-mongodb-uri",
        "JWT_SECRET": "your-jwt-secret-key"
      }
    }
   ```
4. Start the development servers:
   Open two terminal windows — one for the backend and one for the frontend.
   - In the first terminal:
     
   ```bash
   cd backend
   npm start
   ```

   - In the second terminal:
     ```bash
     cd app
     npm start
   ```
5. Access the app and GraphQL API:
   - Frontend App: http://localhost:3000
   - GraphQL Playground (Backend): http://localhost:8080/graphql
      
   
   
