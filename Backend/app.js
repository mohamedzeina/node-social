const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { graphqlHTTP } = require('express-graphql');
const { v4: uuidv4 } = require('uuid');

const cloudinary = require('./cloudinary');
const grapqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');

const app = express();

// --------------------- File Upload Configuration ---------------------

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Create a Cloudinary-backed multer instance for a specific folder.
// All uploads go under `dispatches/<folder>` to keep the account tidy.
const uploadFor = (folder, sizeLimitBytes) =>
  multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `dispatches/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: () => uuidv4(),
      },
    }),
    fileFilter,
    limits: { fileSize: sizeLimitBytes },
  }).single('image');

const postImageUpload = uploadFor('posts', 10 * 1024 * 1024);   // 10 MB
const avatarUpload    = uploadFor('avatars', 5 * 1024 * 1024);  //  5 MB

// --------------------- Middleware ---------------------

app.use(bodyParser.json()); // Parse incoming JSON requests

// Enable Cross-Origin Resource Sharing (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}); // Every response sent by the server will have these headers

// Authentication middleware (adds req.isAuth and req.user if valid JWT is provided)
app.use(auth);

// Handle post image upload and replacement (auth required)
app.put('/post-image', postImageUpload, (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }

  if (req.body.oldPath) {
    const match = req.body.oldPath.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png)$/i);
    if (match) {
      cloudinary.uploader.destroy(match[1]).catch(console.error);
    }
  }

  return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
});

// Handle avatar upload. Public on purpose — runs during signup before
// the user has a JWT. Auth-protected updates go through the
// `updateAvatar` GraphQL mutation, which uses this endpoint's URL.
app.post('/avatar-upload', avatarUpload, (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided!' });
  }
  return res
    .status(201)
    .json({ message: 'Avatar stored.', filePath: req.file.path });
});

// GraphQL endpoint configuration
app.use(
  '/graphql',
  graphqlHTTP({
    schema: grapqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occured!';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

// Global error handling middleware — must be after all routes
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    console.log('Connection Established');
    app.listen(8080); // Start server on port 8080
  })
  .catch((err) => {
    console.log(err);
  });
