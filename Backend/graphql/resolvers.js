const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const cloudinary = require('../cloudinary');

/**
 * Project a Post document into the shape the GraphQL schema expects,
 * including computed `likeCount` and `likedByMe` fields.
 */
const projectPost = (post, viewerId) => {
  const likes = post.likes || [];
  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likeCount: likes.length,
    likedByMe: viewerId
      ? likes.some((id) => id.toString() === viewerId.toString())
      : false,
    commentCount: post.commentCount || 0,
    // comments is only populated by getPost — feed queries leave it
    // unresolved so they don't fan out to the comments collection
    comments: post._populatedComments
      ? post._populatedComments.map(projectComment)
      : null,
  };
};

/**
 * Project a Comment document into GraphQL shape.
 */
const projectComment = (comment) => ({
  ...comment._doc,
  _id: comment._id.toString(),
  post: comment.post.toString ? comment.post.toString() : comment.post,
  createdAt: comment.createdAt.toISOString(),
  updatedAt: comment.updatedAt.toISOString(),
});

/**
 * Project a User document into GraphQL shape. Handles missing
 * createdAt for legacy users (before timestamps were added).
 */
const projectUser = (user) => ({
  ...user._doc,
  _id: user._id.toString(),
  createdAt: user.createdAt ? user.createdAt.toISOString() : null,
});

module.exports = {
  /**
   * Register a new user
   * Validates email/password, hashes password, and saves user in DB
   */
  createUser: async function ({ userInput }, req) {
    const errors = [];

    // Input validation
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'E-Mail is invalid.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 6 })
    ) {
      errors.push({ message: 'Password too short.' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error('User exists already.');
      error.code = 401;
      throw error;
    }

    // Hash password and create user
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
      avatarUrl: userInput.avatarUrl || null,
    });

    const createdUser = await user.save();
    return projectUser(createdUser);
  },

  /**
   * Login user
   * Validates email/password and returns JWT
   */
  login: async function ({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found.');
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is incorrect.');
      error.code = 401;
      throw error;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { token, userId: user._id.toString() };
  },

  /**
   * Create a post
   * Requires authentication; validates title/content; associates post with user
   */
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const errors = [];
    if (validator.isEmpty(postInput.title))
      errors.push({ message: 'Title should not be empty' });
    if (!validator.isLength(postInput.title, { min: 5 }))
      errors.push({ message: 'Title should have a minimum length of 5' });
    if (validator.isEmpty(postInput.content))
      errors.push({ message: 'Content should not be empty' });
    if (!validator.isLength(postInput.content, { min: 5 }))
      errors.push({ message: 'Content should have a minimum length of 5' });
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) throw new Error('Invalid User.');

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });

    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    return projectPost(createdPost, req.userId);
  },

  /**
   * Get paginated posts
   * Requires authentication
   */
  getPosts: async function ({ page }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');
    page = page || 1;
    const perPage = 2;

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('creator');

    return {
      posts: posts.map((p) => projectPost(p, req.userId)),
      totalPosts,
    };
  },

  /**
   * Get a single post by ID
   * Requires authentication
   */
  getPost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('No post found!');

    // Fetch comments separately (chronological — oldest first reads
    // like a conversation) and attach to the post for projection.
    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .populate('author');
    post._populatedComments = comments;

    return projectPost(post, req.userId);
  },

  /**
   * Update a post
   * Requires authentication and authorization (only creator)
   */
  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id).populate('creator');
    if (!post) throw new Error('No post found!');
    if (post.creator._id.toString() !== req.userId.toString()) {
      throw new Error('Not authorized!');
    }

    const errors = [];
    if (validator.isEmpty(postInput.title))
      errors.push({ message: 'Title should not be empty' });
    if (!validator.isLength(postInput.title, { min: 5 }))
      errors.push({ message: 'Title should have a minimum length of 5' });
    if (validator.isEmpty(postInput.content))
      errors.push({ message: 'Content should not be empty' });
    if (!validator.isLength(postInput.content, { min: 5 }))
      errors.push({ message: 'Content should have a minimum length of 5' });
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = postInput.title;
    post.content = postInput.content;
    if (postInput.imageUrl !== 'undefined') post.imageUrl = postInput.imageUrl;

    const updatedPost = await post.save();
    return projectPost(updatedPost, req.userId);
  },

  /**
   * Delete a post
   * Requires authentication and authorization
   */
  deletePost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findById(id);
    if (!post) throw new Error('No post found!');
    if (post.creator.toString() !== req.userId.toString())
      throw new Error('Not authorized!');

    // Extract the Cloudinary public_id including any folder prefix.
    // New posts live under dispatches/posts/<uuid>; older ones may be
    // at the root. Match `/image/upload/[v123/]<publicId>.<ext>`.
    const match = post.imageUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png)$/i);
    if (match) {
      cloudinary.uploader.destroy(match[1]).catch(console.error);
    }
    await Post.findByIdAndDelete(id);

    // Cascade-delete the post's comments so we don't leak orphans.
    await Comment.deleteMany({ post: id });

    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();

    return true;
  },

  /**
   * Get current authenticated user
   */
  user: async function (args, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(req.userId);
    if (!user) throw new Error('No user found!');

    return projectUser(user);
  },

  /**
   * Get any user's profile by id (requires auth).
   * Posts are populated and projected so the profile page can render
   * the user's contributions in the same shape as the feed.
   */
  getUser: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(id).populate({
      path: 'posts',
      populate: { path: 'creator' },
      options: { sort: { createdAt: -1 } },
    });

    if (!user) {
      const err = new Error('User not found.');
      err.code = 404;
      throw err;
    }

    const posts = (user.posts || []).map((p) => projectPost(p, req.userId));
    return { ...projectUser(user), posts };
  },

  /**
   * Update current user's status
   */
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(req.userId);
    if (!user) throw new Error('No user found!');

    user.status = status;
    await user.save();

    return projectUser(user);
  },

  /**
   * Update current user's avatar URL
   * Cleans up the previous avatar from Cloudinary (if it was a Cloudinary asset)
   */
  updateAvatar: async function ({ avatarUrl }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const user = await User.findById(req.userId);
    if (!user) throw new Error('No user found!');

    // Best-effort cleanup of the previous Cloudinary avatar
    if (user.avatarUrl) {
      const match = user.avatarUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.(?:jpg|jpeg|png)$/i);
      if (match) {
        cloudinary.uploader.destroy(match[1]).catch(console.error);
      }
    }

    user.avatarUrl = avatarUrl;
    await user.save();
    return projectUser(user);
  },

  /**
   * Like a post — idempotent ($addToSet won't duplicate)
   * Requires authentication
   */
  likePost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    ).populate('creator');

    if (!post) throw new Error('No post found!');
    return projectPost(post, req.userId);
  },

  /**
   * Unlike a post — idempotent ($pull is a no-op if not present)
   * Requires authentication
   */
  unlikePost: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const post = await Post.findByIdAndUpdate(
      id,
      { $pull: { likes: req.userId } },
      { new: true }
    ).populate('creator');

    if (!post) throw new Error('No post found!');
    return projectPost(post, req.userId);
  },

  /**
   * Add a comment to a post.
   * Validates content, creates a Comment doc, atomically bumps the
   * denormalised commentCount on the parent Post.
   */
  addComment: async function ({ postId, content }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const trimmed = (content || '').trim();
    if (!trimmed) {
      const err = new Error('Comment cannot be empty.');
      err.code = 422;
      throw err;
    }
    if (trimmed.length > 2000) {
      const err = new Error('Comment is too long (max 2000 chars).');
      err.code = 422;
      throw err;
    }

    // Make sure the post exists before we create an orphaned comment
    const post = await Post.findById(postId);
    if (!post) {
      const err = new Error('No post found.');
      err.code = 404;
      throw err;
    }

    const comment = await Comment.create({
      content: trimmed,
      author: req.userId,
      post: postId,
    });

    // Atomically increment the denormalised counter on the parent
    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });

    await comment.populate('author');
    return projectComment(comment);
  },

  /**
   * Delete a comment. Only the author can delete their own comment.
   */
  deleteComment: async function ({ id }, req) {
    if (!req.isAuth) throw new Error('Not authenticated!');

    const comment = await Comment.findById(id);
    if (!comment) {
      const err = new Error('Comment not found.');
      err.code = 404;
      throw err;
    }
    if (comment.author.toString() !== req.userId.toString()) {
      const err = new Error('Not authorized!');
      err.code = 403;
      throw err;
    }

    await Comment.deleteOne({ _id: id });
    // Decrement counter; clamp to 0 via the model's `min` constraint
    await Post.updateOne({ _id: comment.post }, { $inc: { commentCount: -1 } });

    return true;
  },
};
