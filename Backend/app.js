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

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: () => uuidv4(),
  },
});

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

// Handle image upload and replacement
app.put('/post-image', (req, res, next) => {
  if (!req.isAuth) {
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
    return res.status(200).json({ message: 'No file provided!' });
  }

  if (req.body.oldPath) {
    const publicId = req.body.oldPath.split('/').pop().split('.')[0];
    cloudinary.uploader.destroy(publicId).catch(console.error);
  }

  return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
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
