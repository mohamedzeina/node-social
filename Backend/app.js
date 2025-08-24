// Core Node.js module for working with file and directory paths
const path = require('path');

// External dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

// Utilities and custom modules
const { v4: uuidv4 } = require('uuid');
const grapqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('../util/file');

const app = express();

// --------------------- File Upload Configuration ---------------------

// Configure disk storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store uploaded files in the 'images' folder
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    // Use a UUID as the filename to avoid collisions
    cb(null, uuidv4());
  },
});

// Filter to allow only specific file types
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

// --------------------- Middleware ---------------------

app.use(bodyParser.json()); // Parse incoming JSON requests

// Configure multer to handle single image uploads under the field name 'image'
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'));

// Serve the 'images' folder statically so images can be accessed via /images/<filename>
app.use('/images', express.static(path.join(__dirname, 'images')));

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

// Global error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  console.log('im here');
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Authentication middleware (adds req.isAuth and req.user if valid JWT is provided)
app.use(auth);

// Handle image upload and replacement
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }

  if (req.body.oldPath) {
    // If a previous image exists, remove it
    clearImage(req.body.oldPath.replace('/', '\\'));
  }
  // Normalize file path for consistency
  filePath = req.file.path.replace('\\', '/');
  return res.status(201).json({ message: 'File stored.', filePath: filePath });
});

// GraphQL endpoint configuration
app.use(
  // Not using post here to allow get requests to use graphiql
  '/graphql',
  graphqlHTTP({
    schema: grapqlSchema, // Schema definition
    rootValue: graphqlResolver, // Resolvers (logic for each field)
    graphiql: true, // Enable GraphiQL UI for testing queries
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

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    console.log('Connection Established');
    app.listen(8080); // Start server on port 8080
  })
  .catch((err) => {
    console.log(err);
  });
