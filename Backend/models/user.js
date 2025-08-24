const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 * Represents registered users of the application.
 *
 * Fields:
 * - email: User's email address (required, unique in production)
 * - password: Hashed password string (required)
 * - name: User's display name (required)
 * - status: Short profile message (default: "I am new!")
 * - posts: Array of Post references (relationship: one-to-many)
 */

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am new!',
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
