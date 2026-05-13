const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Comment Schema
 *
 * One document per comment. Comments live in their own collection
 * (not embedded in Post) so they can be paginated per-post, queried
 * by author, and grow without bumping into MongoDB's 16MB document
 * cap. Post denormalises a `commentCount` for fast feed rendering.
 *
 * Fields:
 * - content: the comment body
 * - author: the User who wrote it
 * - post: the Post being commented on
 *
 * Indexes:
 * - { post: 1, createdAt: 1 } — fast "comments for a post, oldest
 *   first" reads, which is the common access pattern
 * - { author: 1, createdAt: -1 } — useful later for "Sara's
 *   comments" on a profile page
 */
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
