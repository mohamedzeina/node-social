const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Post Schema
 * Represents a user-created post in the application.
 *
 * Fields:
 * - title: Title of the post (required)
 * - imageUrl: Path or URL to the image associated with the post (required)
 * - content: Main body/content of the post (required)
 * - creator: Reference to the User who created the post (required)
 *
 * Options:
 * - timestamps: Automatically adds `createdAt` and `updatedAt` fields
 */

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } // CreatedAt and UpdatedAt timestamps added by mongoose
);

module.exports = mongoose.model('Post', postSchema);
