const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serving folder statically for requests going to /images

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}); // Every response sent by the server will have these headers

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
  // Error handling middleware
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(app.listen(8080))
  .catch((err) => {
    console.log(err);
  });
